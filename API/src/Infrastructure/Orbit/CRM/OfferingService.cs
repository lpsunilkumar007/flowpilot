using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Application.Common.Models;
using FlowPilot.Application.CRM;
using FlowPilot.Application.CRM.Model.Request.Offering;
using FlowPilot.Application.CRM.Model.Response.Offering;
using FlowPilot.Application.Nexus.Identity.Users;
using FlowPilot.Domain.CRM;
using FlowPilot.Domain.Enums.CRM;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Infrastructure.SystemConstants;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Orbit.CRM;

public class OfferingService : IOfferingService
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;
    private readonly IReportingHierarchyService _reportingHierarchyService;

    public OfferingService(
        ApplicationDbContext db,
        ICurrentUser currentUser,
        IReportingHierarchyService reportingHierarchyService)
    {
        _db = db;
        _currentUser = currentUser;
        _reportingHierarchyService = reportingHierarchyService;
    }

    public async Task<PaginationResponse<ViewOfferingResponse>> SearchAsync(SearchOfferingRequest request, CancellationToken cancellationToken = default)
    {
        var query = await BuildOfferingQueryAsync(request, cancellationToken);
        var projected = query.Select(x => new ViewOfferingResponse
        {
            Id = x.Id,
            UniqueId = x.UniqueId,
            Name = x.Name,
            Type = x.Type,
            Status = x.Status,
            Description = x.Description,
            OwnerUserId = x.FKOwnerUserId,
            ExpectedValueFrom = x.ExpectedValueFrom,
            ExpectedValueTo = x.ExpectedValueTo,
            LeadCount = x.Leads.Count,
            CreatedOn = x.CreatedOn,
        });

        return await projected.PaginatedListAsync<ViewOfferingResponse, ViewOfferingResponse>(request.PageNumber, request.PageSize);
    }

    public async Task<List<OfferingDropDownItemResponse>> GetActiveDropDownAsync(CancellationToken cancellationToken = default)
    {
        var query = _db.Offerings
            .AsNoTracking()
            .Where(x => x.Status == OfferingStatus.Active);

        query = await ApplyOfferingScopeForCurrentUserAsync(query, cancellationToken);

        return await query
            .OrderBy(x => x.Name)
            .Select(x => new OfferingDropDownItemResponse
            {
                Value = x.Id,
                UniqueId = x.UniqueId,
                Text = x.Name,
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<ViewOfferingResponse> GetByIdAsync(DefaultIdType id, CancellationToken cancellationToken = default)
    {
        var offering = await _db.Offerings
            .AsNoTracking()
            .Include(x => x.Leads)
            .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

        _ = offering ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Offering"));
        await EnsureCanReadOfferingAsync(offering.FKOwnerUserId, cancellationToken);

        return MapToResponse(offering);
    }

    public async Task<CreateOfferingResponse> CreateAsync(CreateOfferingRequest request, CancellationToken cancellationToken = default)
    {
        await EnsureCanWriteOfferingAsync(request.OwnerUserId, cancellationToken);
        await EnsureUniqueActiveNameAsync(request.Name, null, request.Status, cancellationToken);
        ValidateExpectedValueRange(request.ExpectedValueFrom, request.ExpectedValueTo);

        var offering = new Offerings
        {
            UniqueId = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Type = request.Type,
            Status = request.Status,
            Description = request.Description,
            FKOwnerUserId = request.OwnerUserId,
            ExpectedValueFrom = request.ExpectedValueFrom,
            ExpectedValueTo = request.ExpectedValueTo,
        };

        await _db.Offerings.AddAsync(offering, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        return new CreateOfferingResponse
        {
            Id = offering.Id,
            Message = SuccessMessages.CommonRecordCreated,
        };
    }

    public async Task<string> UpdateAsync(DefaultIdType id, UpdateOfferingRequest request, CancellationToken cancellationToken = default)
    {
        var offering = await _db.Offerings.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        _ = offering ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Offering"));

        await EnsureCanWriteOfferingAsync(offering.FKOwnerUserId, cancellationToken);
        await EnsureCanWriteOfferingAsync(request.OwnerUserId, cancellationToken);
        await EnsureUniqueActiveNameAsync(request.Name, id, request.Status, cancellationToken);
        ValidateExpectedValueRange(request.ExpectedValueFrom, request.ExpectedValueTo);

        offering.Name = request.Name.Trim();
        offering.Type = request.Type;
        offering.Status = request.Status;
        offering.Description = request.Description;
        offering.FKOwnerUserId = request.OwnerUserId;
        offering.ExpectedValueFrom = request.ExpectedValueFrom;
        offering.ExpectedValueTo = request.ExpectedValueTo;

        await _db.SaveChangesAsync(cancellationToken);
        return SuccessMessages.CommonRecordUpdated;
    }

    public async Task<string> UpdateStatusAsync(DefaultIdType id, UpdateOfferingStatusRequest request, CancellationToken cancellationToken = default)
    {
        var offering = await _db.Offerings.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        _ = offering ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Offering"));

        await EnsureCanWriteOfferingAsync(offering.FKOwnerUserId, cancellationToken);
        await EnsureUniqueActiveNameAsync(offering.Name, id, request.Status, cancellationToken);

        offering.Status = request.Status;
        await _db.SaveChangesAsync(cancellationToken);
        return SuccessMessages.CommonRecordUpdated;
    }

    public async Task<string> DeleteAsync(DefaultIdType id, CancellationToken cancellationToken = default)
    {
        var offering = await _db.Offerings.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        _ = offering ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Offering"));

        await EnsureCanWriteOfferingAsync(offering.FKOwnerUserId, cancellationToken);

        offering.IsDeleted = true;
        await _db.SaveChangesAsync(cancellationToken);
        return string.Format(SuccessMessages.RecordDeletedSuccessfully, "Offering");
    }

    private async Task<IQueryable<Offerings>> BuildOfferingQueryAsync(SearchOfferingRequest request, CancellationToken cancellationToken)
    {
        var query = _db.Offerings.AsNoTracking().AsQueryable();

        if (request.Type.HasValue)
        {
            query = query.Where(x => x.Type == request.Type.Value);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(x => x.Status == request.Status.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.OwnerUserId))
        {
            if (!await _reportingHierarchyService.CanReadAsync(request.OwnerUserId, cancellationToken))
            {
                throw new ForbiddenException(ErrorMessages.NotAuthorized);
            }

            query = query.Where(x => x.FKOwnerUserId == request.OwnerUserId);
        }
        else
        {
            query = await ApplyOfferingScopeForCurrentUserAsync(query, cancellationToken);
        }

        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            var term = request.SearchText.Trim().ToLower();
            query = query.Where(x =>
                x.Name.ToLower().Contains(term)
                || (x.Description != null && x.Description.ToLower().Contains(term))
                || x.Id.ToString().Contains(term));
        }

        return query.OrderByDescending(x => x.CreatedOn);
    }

    private async Task<IQueryable<Offerings>> ApplyOfferingScopeForCurrentUserAsync(IQueryable<Offerings> query, CancellationToken cancellationToken)
    {
        if (await _reportingHierarchyService.IsTenantAdminAsync(cancellationToken))
        {
            return query;
        }

        var accessibleUserIds = await _reportingHierarchyService.GetAccessibleUserIdsAsync(cancellationToken);
        return query.Where(x => accessibleUserIds.Contains(x.FKOwnerUserId));
    }

    private async Task EnsureCanReadOfferingAsync(string ownerUserId, CancellationToken cancellationToken)
    {
        if (!await _reportingHierarchyService.CanReadAsync(ownerUserId, cancellationToken))
        {
            throw new ForbiddenException(ErrorMessages.NotAuthorized);
        }
    }

    private async Task EnsureCanWriteOfferingAsync(string ownerUserId, CancellationToken cancellationToken)
    {
        if (!await _reportingHierarchyService.CanWriteAsync(ownerUserId, cancellationToken))
        {
            throw new ForbiddenException(ErrorMessages.NotAuthorized);
        }
    }

    private async Task EnsureUniqueActiveNameAsync(string name, DefaultIdType? excludeId, OfferingStatus status, CancellationToken cancellationToken)
    {
        if (status != OfferingStatus.Active)
        {
            return;
        }

        var normalizedName = name.Trim().ToLower();
        var exists = await _db.Offerings
            .AsNoTracking()
            .AnyAsync(x => x.Status == OfferingStatus.Active
                && x.Name.ToLower() == normalizedName
                && (!excludeId.HasValue || x.Id != excludeId.Value), cancellationToken);

        if (exists)
        {
            throw new ConflictException(string.Format(ErrorMessages.ItemAlreadyExists, name.Trim()));
        }
    }

    private static void ValidateExpectedValueRange(decimal? from, decimal? to)
    {
        if (from.HasValue && to.HasValue && from.Value > to.Value)
        {
            throw new BadRequestException("Expected value from cannot be greater than expected value to.");
        }
    }

    private static ViewOfferingResponse MapToResponse(Offerings offering) => new()
    {
        Id = offering.Id,
        UniqueId = offering.UniqueId,
        Name = offering.Name,
        Type = offering.Type,
        Status = offering.Status,
        Description = offering.Description,
        OwnerUserId = offering.FKOwnerUserId,
        ExpectedValueFrom = offering.ExpectedValueFrom,
        ExpectedValueTo = offering.ExpectedValueTo,
        LeadCount = offering.Leads.Count,
        CreatedOn = offering.CreatedOn,
    };
}
