using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Application.Common.Models;
using FlowPilot.Application.Email;
using FlowPilot.Application.Email.Model.Request.EmailTemplate;
using FlowPilot.Application.Email.Model.Response.EmailTemplate;
using FlowPilot.Domain.Email;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Infrastructure.SystemConstants;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Orbit.Email;
public class EmailTemplateService : IEmailTemplateService
{
    private readonly ApplicationDbContext _applicationDbContext;
    private readonly ICurrentUser _currentUser;

    public EmailTemplateService(ApplicationDbContext applicationDbContext, ICurrentUser currentUser)
    {
        _applicationDbContext = applicationDbContext;
        _currentUser = currentUser;
    }

    public async Task<CreateEmailTemplateResponse> CreateEmailTemplateAsync(CreateEmailTemplateRequest request)
    {
        if (request.IsShared)
        {
            var existingItem1 = await _applicationDbContext.EmailTemplates.SingleOrDefaultAsync(x => x.Name.ToLower() == request.Name.ToLower()
            && x.IsShared == true && x.TemplateUsedFor == request.TemplateUsedFor);
            if (existingItem1 != null)
            {
                throw new ConflictException(string.Format(ErrorMessages.EmailTemplateSharedAlreadyExists, existingItem1.Name));
            }
        }
        else
        {
            var existingItem2 = await _applicationDbContext.EmailTemplates.SingleOrDefaultAsync(x => x.Name.ToLower() == request.Name.ToLower()
            && x.CreatedBy == _currentUser.GetUserId());
            if (existingItem2 != null)
            {
                throw new ConflictException(string.Format(ErrorMessages.ItemAlreadyExists, existingItem2.Name));
            }
        }

        var entity = new EmailTemplates
        {
            Name = request.Name,
            Description = request.Description,
            TemplateUsedFor = request.TemplateUsedFor,
            EmailSubject = request.EmailSubject,
            EmailBody = request.EmailBody,
            IsShared = request.IsShared
        };
        await _applicationDbContext.EmailTemplates.AddAsync(entity);
        await _applicationDbContext.SaveChangesAsync();

        return new CreateEmailTemplateResponse { Id = entity.Id, Message = SuccessMessages.RecordAddedSuccessfully };
    }

    public async Task<string> DeleteEmailTemplateAsync(int id)
    {
        var entity = await _applicationDbContext.EmailTemplates.SingleOrDefaultAsync(c => c.Id == id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Item"));

        _applicationDbContext.EmailTemplates.Update(entity).State = EntityState.Deleted;
        await _applicationDbContext.SaveChangesAsync();

        return string.Format(SuccessMessages.RecordDeletedSuccessfully, entity.Name);
    }

    public async Task<ViewEmailTemplateDetailResponse> GetEmailTemplateByIdAsync(int id)
    {
        var entity = await _applicationDbContext.EmailTemplates.SingleOrDefaultAsync(x => x.Id == id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Item"));

        return entity.Adapt<ViewEmailTemplateDetailResponse>();
    }

    public async Task<string> UpdateEmailTemplateAsync(UpdateEmailTemplateRequest request)
    {
        var entity = await _applicationDbContext.EmailTemplates.SingleOrDefaultAsync(x => x.Id == request.Id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Item"));

        if (request.IsShared)
        {
            var existingItem1 = await _applicationDbContext.EmailTemplates.SingleOrDefaultAsync(x => x.Name.ToLower() == request.Name.ToLower()
            && x.IsShared == true && x.TemplateUsedFor == request.TemplateUsedFor && x.Id != request.Id);
            if (existingItem1 != null)
            {
                throw new ConflictException(string.Format(ErrorMessages.EmailTemplateSharedAlreadyExists, existingItem1.Name));
            }
        }
        else
        {
            var existingItem2 = await _applicationDbContext.EmailTemplates.SingleOrDefaultAsync(x => x.Name.ToLower() == request.Name.ToLower()
            && x.CreatedBy == _currentUser.GetUserId() && x.Id != request.Id);
            if (existingItem2 != null)
            {
                throw new ConflictException(string.Format(ErrorMessages.ItemAlreadyExists, existingItem2.Name));
            }
        }

        entity.Name = request.Name;
        entity.Description = request.Description;
        entity.TemplateUsedFor = request.TemplateUsedFor;
        entity.EmailSubject = request.EmailSubject;
        entity.EmailBody = request.EmailBody;
        entity.IsShared = request.IsShared;

        _applicationDbContext.EmailTemplates.Update(entity);
        await _applicationDbContext.SaveChangesAsync();

        return SuccessMessages.RecordUpdatedSuccessfully;
    }

    public async Task<PaginationResponse<ViewEmailTemplateResponse>> ViewEmailTemplateAsync(SearchEmailTemplateRequest request)
    {
        var query = _applicationDbContext.EmailTemplates.AsQueryable();

        if (request.TemplateUsedFor.HasValue)
        {
            query = query.Where(x => x.TemplateUsedFor == request.TemplateUsedFor.Value);
        }

        if (!string.IsNullOrEmpty(request.NameDescription))
        {
            query = query.Where(x => x.Name.Contains(request.NameDescription)
           || x.Description.Contains(request.NameDescription));
        }

        if (request.IsShared.HasValue && request.IsShared.Value)
        {
            query = query.Where(x => x.IsShared == request.IsShared);
        }
        else
        {
            query = query.Where(x => x.CreatedBy == _currentUser.GetUserId());
        }

        var selectQuery = query.Select(x => new ViewEmailTemplateResponse
        {
            Name = x.Name,
            Id = x.Id,
            Description = x.Description,
            TemplateUsedFor = x.TemplateUsedFor,
            EmailSubject = x.EmailSubject,
            IsShared = x.IsShared,
        });

        return await selectQuery.PaginatedListAsync<ViewEmailTemplateResponse, ViewEmailTemplateResponse>(request.PageNumber, request.PageSize);
    }
}