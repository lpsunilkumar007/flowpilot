using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Application.Common.Models;
using FlowPilot.Application.CRM;
using FlowPilot.Application.CRM.Model.Request.Task;
using FlowPilot.Application.CRM.Model.Response.Task;
using FlowPilot.Application.Nexus.Identity.Users;
using FlowPilot.Domain.CRM;
using FlowPilot.Domain.Enums.CRM;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Infrastructure.SystemConstants;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Orbit.CRM;

public class TaskService : ITaskService
{
    private readonly ApplicationDbContext _db;
    private readonly IDateTimeService _dateTimeService;
    private readonly ICurrentUser _currentUser;
    private readonly IReportingHierarchyService _reportingHierarchyService;

    public TaskService(
        ApplicationDbContext db,
        IDateTimeService dateTimeService,
        ICurrentUser currentUser,
        IReportingHierarchyService reportingHierarchyService)
    {
        _db = db;
        _dateTimeService = dateTimeService;
        _currentUser = currentUser;
        _reportingHierarchyService = reportingHierarchyService;
    }

    public async Task<PaginationResponse<ViewTaskResponse>> SearchAsync(SearchTaskRequest request, CancellationToken cancellationToken = default)
    {
        var query = await BuildTaskQueryAsync(request, cancellationToken);
        var today = _dateTimeService.UtcNow;
        var tomorrow = today.AddDays(1);
        var dayAfterTomorrow = today.AddDays(2);

        var projected = query.Select(x => new ViewTaskResponse
        {
            Id = x.Id,
            Uuid = x.Uuid,
            Title = x.Title,
            When = x.When,
            Bucket = x.Bucket ?? (
                x.When < today ? TaskBucket.Overdue
                : x.When < tomorrow ? TaskBucket.Today
                : x.When < dayAfterTomorrow ? TaskBucket.Tomorrow
                : TaskBucket.Future),
            Type = x.Type,
            Priority = x.Priority,
            IsCompleted = x.IsCompleted,
            CreatedOn = x.CreatedOn,
        });

        return await projected.PaginatedListAsync<ViewTaskResponse, ViewTaskResponse>(request.PageNumber, request.PageSize);
    }

    public async Task<ViewTaskResponse> GetByIdAsync(DefaultIdType id, CancellationToken cancellationToken = default)
    {
        var tasks = await _db.Tasks
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

        _ = tasks ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Task"));
        await EnsureCanReadTaskAsync(tasks.CreatedBy, cancellationToken);

        return MapToResponse(tasks, _dateTimeService.UtcNow.Date);
    }

    public async Task<CreateTaskResponse> CreateAsync(CreateTaskRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new Tasks
        {
            Uuid = Guid.NewGuid(),
            Title = request.Title.Trim(),
            When = request.When,
            Bucket = request.Bucket,
            Type = request.Type,
            Priority = request.Priority,
        };

        await _db.Tasks.AddAsync(entity, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        return new CreateTaskResponse
        {
            Id = entity.Id,
            Uuid = entity.Uuid,
            Message = SuccessMessages.CommonRecordCreated,
        };
    }

    public async Task<string> UpdateAsync(DefaultIdType id, UpdateTaskRequest request, CancellationToken cancellationToken = default)
    {
        var task = await _db.Tasks.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        _ = task ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Task"));
        await EnsureCanWriteTaskAsync(task.CreatedBy, cancellationToken);

        task.Title = request.Title.Trim();
        task.When = request.When;
        task.Bucket = request.Bucket ?? ComputeBucket(request.When, _dateTimeService.UtcNow.Date);
        task.Type = request.Type;
        task.Priority = request.Priority;

        await _db.SaveChangesAsync(cancellationToken);
        return SuccessMessages.CommonRecordUpdated;
    }

    public async Task<string> MarkCompletedAsync(DefaultIdType id, MarkTaskCompletedRequest request, CancellationToken cancellationToken = default)
    {
        var task = await _db.Tasks.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        _ = task ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Task"));
        await EnsureCanWriteTaskAsync(task.CreatedBy, cancellationToken);

        task.IsCompleted = request.IsCompleted;
        await _db.SaveChangesAsync(cancellationToken);
        return SuccessMessages.CommonRecordUpdated;
    }

    public async Task<string> DeleteAsync(DefaultIdType id, CancellationToken cancellationToken = default)
    {
        var task = await _db.Tasks.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        _ = task ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Task"));
        await EnsureCanWriteTaskAsync(task.CreatedBy, cancellationToken);

        task.IsDeleted = true;
        await _db.SaveChangesAsync(cancellationToken);

        return string.Format(SuccessMessages.RecordDeletedSuccessfully, "Task");
    }

    private async Task<IQueryable<Tasks>> BuildTaskQueryAsync(SearchTaskRequest request, CancellationToken cancellationToken)
    {
        var query = _db.Tasks.AsNoTracking().AsQueryable();
        var today = _dateTimeService.UtcNow;
        var tomorrow = today.AddDays(1);
        var dayAfterTomorrow = today.AddDays(2);

        if (request.Type.HasValue)
        {
            query = query.Where(x => x.Type == request.Type.Value);
        }

        if (request.Priority.HasValue)
        {
            query = query.Where(x => x.Priority == request.Priority.Value);
        }

        if (request.Bucket.HasValue)
        {
            query = request.Bucket.Value switch
            {
                TaskBucket.Today => query.Where(x => x.When >= today && x.When < tomorrow),
                TaskBucket.Tomorrow => query.Where(x => x.When >= tomorrow && x.When < dayAfterTomorrow),
                TaskBucket.Overdue => query.Where(x => x.When < today),
                TaskBucket.Future => query.Where(x => x.When >= dayAfterTomorrow),
                _ => query,
            };
        }

        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            var term = request.SearchText.Trim().ToLower();
            query = query.Where(x => x.Title.ToLower().Contains(term) || x.Uuid.ToString().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(request.CreatedByUserId))
        {
            if (!await _reportingHierarchyService.CanReadAsync(request.CreatedByUserId, cancellationToken))
            {
                throw new ForbiddenException(ErrorMessages.NotAuthorized);
            }

            if (!Guid.TryParse(request.CreatedByUserId, out var createdByGuid))
            {
                throw new ForbiddenException(ErrorMessages.NotAuthorized);
            }

            query = query.Where(x => x.CreatedBy == createdByGuid);
        }
        else
        {
            query = query.Where(x => x.CreatedBy == _currentUser.GetUserId());
        }

        return query.OrderBy(x => x.When).ThenByDescending(x => x.CreatedOn);
    }

    private async Task EnsureCanReadTaskAsync(Guid createdBy, CancellationToken cancellationToken)
    {
        if (createdBy == _currentUser.GetUserId())
        {
            return;
        }

        if (!await _reportingHierarchyService.CanReadAsync(createdBy.ToString(), cancellationToken))
        {
            throw new ForbiddenException(ErrorMessages.NotAuthorized);
        }
    }

    private async Task EnsureCanWriteTaskAsync(Guid createdBy, CancellationToken cancellationToken)
    {
        if (createdBy == _currentUser.GetUserId())
        {
            return;
        }

        if (!await _reportingHierarchyService.CanWriteAsync(createdBy.ToString(), cancellationToken))
        {
            throw new ForbiddenException(ErrorMessages.NotAuthorized);
        }
    }

    private static TaskBucket ComputeBucket(DateTimeOffset when, DateTime today)
    {
        var date = when.Date;
        if (date < today) return TaskBucket.Overdue;
        if (date == today) return TaskBucket.Today;
        if (date == today.AddDays(1)) return TaskBucket.Tomorrow;
        return TaskBucket.Future;
    }

    private static ViewTaskResponse MapToResponse(Tasks task, DateTime today) => new()
    {
        Id = task.Id,
        Uuid = task.Uuid,
        Title = task.Title,
        When = task.When,
        Bucket = task.Bucket ?? ComputeBucket(task.When, today),
        Type = task.Type,
        Priority = task.Priority,
        IsCompleted = task.IsCompleted,
        CreatedOn = task.CreatedOn,
    };
}
