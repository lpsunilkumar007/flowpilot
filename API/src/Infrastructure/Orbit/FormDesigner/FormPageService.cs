using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Models;
using FlowPilot.Application.FormDesigner;
using FlowPilot.Application.FormDesigner.Model.Request.FormPages;
using FlowPilot.Application.FormDesigner.Model.Response.FormPages;
using FlowPilot.Domain.FormDesigner;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Infrastructure.SystemConstants;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Orbit.FormDesigner;
public class FormPageService : IFormPageService
{
    private readonly ApplicationDbContext _applicationDbContext;

    public FormPageService(ApplicationDbContext applicationDbContext)
    {
        _applicationDbContext = applicationDbContext;
    }

    public async Task<CreateFormPageResponse> CreateFormPage(CreateFormPageRequest request)
    {
        var entity = new FormPages
        {
            FKFormStructurePKId = request.FKFormStructurePKId,
            Title = request.Title,
            Description = request.Description,
            IntroText = request.IntroText,
            DisplayOrder = request.DisplayOrder,
        };
        await _applicationDbContext.FormPages.AddAsync(entity);
        await _applicationDbContext.SaveChangesAsync();

        return new CreateFormPageResponse
        {
            Id = entity.Id,
            Message = SuccessMessages.CommonRecordCreated
        };
    }

    public async Task<string> DeleteFormPage(DefaultIdType id)
    {
        var entity = await _applicationDbContext.FormPages.SingleOrDefaultAsync(x => x.Id == id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Item"));

        _applicationDbContext.FormPages.Update(entity).State = EntityState.Deleted;

        await _applicationDbContext.SaveChangesAsync();

        return string.Format(SuccessMessages.RecordDeletedSuccessfully, entity.Title);
    }

    public async Task<ViewFormPageDetailResponse> GetFormPageById(DefaultIdType id)
    {
        var result = await _applicationDbContext.FormPages.SingleOrDefaultAsync(x => x.Id == id);
        _ = result ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "item"));

        return result.Adapt<ViewFormPageDetailResponse>();
    }

    public async Task<PaginationResponse<ViewFormPageDetailResponse>> GetFormPages(SearchFormPageRequest request)
    {
        var query = _applicationDbContext.FormPages.Where(x => x.FKFormStructurePKId == request.FKFormStructurePKId);

        var selectQuery = query.Select(x => new ViewFormPageDetailResponse
        {
            Id = x.Id,
            FKFormStructurePKId = x.FKFormStructurePKId,
            Title = x.Title,
            Description = x.Description,
            IntroText = x.IntroText,
            DisplayOrder = x.DisplayOrder,
        });

        return await selectQuery.PaginatedListAsync<ViewFormPageDetailResponse, ViewFormPageDetailResponse>(request.PageNumber, request.PageSize);
    }

    public async Task<string> UpdateFormPage(UpdateFormPageRequest request)
    {
        var entity = await _applicationDbContext.FormPages.SingleOrDefaultAsync(x => x.Id == request.Id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Item"));

        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.IntroText = request.IntroText;
        entity.DisplayOrder = request.DisplayOrder;

        _applicationDbContext.FormPages.Update(entity);
        await _applicationDbContext.SaveChangesAsync();

        return SuccessMessages.CommonRecordUpdated;
    }
}
