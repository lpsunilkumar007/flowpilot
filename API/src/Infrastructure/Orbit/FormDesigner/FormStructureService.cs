using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Models;
using FlowPilot.Application.FormDesigner;
using FlowPilot.Application.FormDesigner.Model.Request.FormStructure;
using FlowPilot.Application.FormDesigner.Model.Response.FormStructure;
using FlowPilot.Domain.FormDesigner;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Infrastructure.SystemConstants;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Orbit.FormDesigner;
public class FormStructureService : IFormStructureService
{
    private readonly ApplicationDbContext _applicationDbContext;
    public FormStructureService(ApplicationDbContext applicationDbContext)
    {
        _applicationDbContext = applicationDbContext;
    }

    public async Task<CreateFormStructureResponse> CreateFormStructure(CreateFormStructureRequest request)
    {
        var entity = new FormStructures
        {
            Name = request.Name,
            FormStatus = request.FormStatus,
            Description = request.Description,
            IntroductionText = request.IntroductionText,
        };
        await _applicationDbContext.FormStructures.AddAsync(entity);
        await _applicationDbContext.SaveChangesAsync();

        return new CreateFormStructureResponse
        {
            Id = entity.Id,
            Message = SuccessMessages.CommonRecordCreated
        };

    }

    public async Task<string> DeleteFormStructure(DefaultIdType id)
    {
        var entity = await _applicationDbContext.FormStructures.SingleOrDefaultAsync(x => x.Id == id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Item"));

        _applicationDbContext.FormStructures.Update(entity).State = EntityState.Deleted;

        await _applicationDbContext.SaveChangesAsync();

        return string.Format(SuccessMessages.RecordDeletedSuccessfully, entity.Name);
    }

    public async Task<ViewFormStructureDetailResponse> GetFormStructureById(DefaultIdType id)
    {
        var result = await _applicationDbContext.FormStructures.SingleOrDefaultAsync(x => x.Id == id);
        _ = result ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "item"));

        return result.Adapt<ViewFormStructureDetailResponse>();
    }

    public async Task<PaginationResponse<ViewFormStructureDetailResponse>> GetFormStructures(SearchFormStructureRequest request)
    {
        var query = _applicationDbContext.FormStructures;
        var selectQuery = query.Select(x => new ViewFormStructureDetailResponse
        {
            Id = x.Id,
            Name = x.Name,
            FormStatus = x.FormStatus,
            Description = x.Description,
            IntroductionText = x.IntroductionText,
        });

        return await selectQuery.PaginatedListAsync<ViewFormStructureDetailResponse, ViewFormStructureDetailResponse>(request.PageNumber, request.PageSize);
    }

    public async Task<string> UpdateFormStructure(UpdateFormStructureRequest request)
    {
        var entity = await _applicationDbContext.FormStructures.SingleOrDefaultAsync(x => x.Id == request.Id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Item"));

        entity.Name = request.Name;
        entity.FormStatus = request.FormStatus;
        entity.Description = request.Description;
        entity.IntroductionText = request.IntroductionText;

        _applicationDbContext.FormStructures.Update(entity);
        await _applicationDbContext.SaveChangesAsync();

        return SuccessMessages.CommonRecordUpdated;
    }
}
