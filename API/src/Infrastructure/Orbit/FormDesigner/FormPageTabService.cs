using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Models;
using FlowPilot.Application.FormDesigner;
using FlowPilot.Application.FormDesigner.Model.Request.FormPageTabs;
using FlowPilot.Application.FormDesigner.Model.Response.FormPageTabs;
using FlowPilot.Domain.FormDesigner;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Infrastructure.SystemConstants;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Orbit.FormDesigner;
public class FormPageTabService : IFormPageTabService
{
    private readonly ApplicationDbContext _applicationDbContext;

    public FormPageTabService(ApplicationDbContext applicationDbContext)
    {
        _applicationDbContext = applicationDbContext;
    }

    public async Task<CreateFormPageTabResponse> CreateFormPageTab(CreateFormPageTabRequest request)
    {
        var entity = new FormPageTabs
        {
            FKFormPagePKId = request.FKFormPagePKId,
            FKFormPageTabPKId = request.FKFormPageTabPKId,
            Name = request.Name,
            DisplayOrder = request.DisplayOrder,
        };
        await _applicationDbContext.FormPageTabs.AddAsync(entity);
        await _applicationDbContext.SaveChangesAsync();

        return new CreateFormPageTabResponse
        {
            Id = entity.Id,
            Message = SuccessMessages.CommonRecordCreated
        };
    }

    public async Task<string> DeleteFormPagTab(DefaultIdType id)
    {
        var entity = await _applicationDbContext.FormPageTabs.SingleOrDefaultAsync(x => x.Id == id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Item"));
        var childTabs = await _applicationDbContext.FormPageTabs.Where(x => x.FKFormPageTabPKId == id).ToListAsync();

        foreach (var child in childTabs)
        {
            child.FKFormPageTabPKId = null;
        }

        _applicationDbContext.FormPageTabs.Update(entity).State = EntityState.Deleted;

        await _applicationDbContext.SaveChangesAsync();

        return string.Format(SuccessMessages.RecordDeletedSuccessfully, entity.Name);
    }

    public async Task<ViewFormPageTabDetailResponse> GetFormPageTabById(DefaultIdType id)
    {
        var entity = await _applicationDbContext.FormPageTabs.SingleOrDefaultAsync(x => x.Id == id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Item"));

        return entity.Adapt<ViewFormPageTabDetailResponse>();
    }

    public async Task<PaginationResponse<ViewFormPageTabDetailResponse>> GetFormPageTabs(SearchFormPageTabRequest request)
    {
        var query = _applicationDbContext.FormPageTabs.Where(x => x.FKFormPagePKId == request.FKFormPagePKId);

        var selectQuery = query.Select(x => new ViewFormPageTabDetailResponse
        {
            Id = x.Id,
            FKFormPagePKId = x.FKFormPagePKId,
            FKFormPageTabPKId = x.FKFormPageTabPKId,
            Name = x.Name,
            DisplayOrder = x.DisplayOrder,
            ParentTabName = x.ParentTab != null ? x.ParentTab.Name : null
        });

        return await selectQuery.PaginatedListAsync<ViewFormPageTabDetailResponse, ViewFormPageTabDetailResponse>(request.PageNumber, request.PageSize);
    }

    public async Task<string> UpdateFormPageTab(UpdateFormPageTabRequest request)
    {
        var entity = await _applicationDbContext.FormPageTabs.SingleOrDefaultAsync(x => x.Id == request.Id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Item"));

        entity.Name = request.Name;
        entity.DisplayOrder = request.DisplayOrder;
        entity.FKFormPageTabPKId = request.FKFormPageTabPKId;

        _applicationDbContext.FormPageTabs.Update(entity);
        await _applicationDbContext.SaveChangesAsync();

        return SuccessMessages.CommonRecordUpdated;
    }
}
