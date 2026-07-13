using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Models;
using FlowPilot.Application.Common.Models.Response;
using FlowPilot.Application.LookUp;
using FlowPilot.Application.LookUp.Models.Request;
using FlowPilot.Application.LookUp.Models.Response;
using FlowPilot.Domain.Enums;
using FlowPilot.Domain.LookUp;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Infrastructure.SystemConstants;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Orbit.LookUp;
public class LookUpService : ILookUpService
{
    private readonly ApplicationDbContext _applicationDbContext;
    public LookUpService(ApplicationDbContext applicationDbContext)
    {
        _applicationDbContext = applicationDbContext;
    }

    public async Task<List<ViewLookUpsResponse>> GetLookUpCodesAsync()
    {
        var result = await _applicationDbContext.LookUpCodes.ToListAsync();
        return result.Adapt<List<ViewLookUpsResponse>>();
    }

    public async Task<PaginationResponse<ViewLookUpCodeValuesResponse>> GetLookUpCodeValuesAsync(SearchLookUpCodeValuesRequest request)
    {
        var query = _applicationDbContext.LookUpCodeValues.Where(x => x.LookUpCode.LookUpCodeType == request.Type);

        if (!string.IsNullOrEmpty(request.sortField))
        {
            query = query.ApplySorting(sortField: request.sortField, sortOrder: request.sortOrder, ["LookUpValue", "DisplayOrder", "IsActive", "IsDefault"], "DisplayOrder");
        }

        return await query.PaginatedListAsync<LookUpCodeValues, ViewLookUpCodeValuesResponse>(request.PageNumber, request.PageSize);

    }

    public async Task<List<DropDownItemResponse>> GetLookUpCodeValuesByTypeAsync(LookUpCodeTypes type)
    {
        var result = await _applicationDbContext.LookUpCodeValues.Where(x => x.LookUpCode.LookUpCodeType == type).ToListAsync();

        return result.OrderBy(x => x.DisplayOrder).ThenBy(x => x.LookUpValue).Select(x => new DropDownItemResponse
        {
            Value = x.Id,
            Text = x.LookUpValue
        }).ToList();
    }


    public async Task<string> CreateLookUpCodeValueAsync(CreateLookUpCodeValueRequest request)
    {
        var existingItem = await _applicationDbContext.LookUpCodeValues.SingleOrDefaultAsync(x => x.FKLookUpCodePKId == request.LookUpCodeId && x.LookUpValue == request.LookUpValue);
        if (existingItem != null)
        {
            throw new ConflictException(string.Format(ErrorMessages.ItemAlreadyExists, request.LookUpValue));
        }

        await _applicationDbContext.LookUpCodeValues.AddAsync(new LookUpCodeValues
        {
            LookUpValue = request.LookUpValue,
            DisplayOrder = request.DisplayOrder,
            FKLookUpCodePKId = request.LookUpCodeId,
            IsActive = request.IsActive,
        });

        await _applicationDbContext.SaveChangesAsync();

        return SuccessMessages.RecordAddedSuccessfully;
    }

    public async Task<string> UpdateLookUpCodeValueAsync(UpdateLookUpCodeValueRequest request)
    {
        var entity = await _applicationDbContext.LookUpCodeValues.SingleOrDefaultAsync(x => x.Id == request.Id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Item"));

        var existingItem = await _applicationDbContext.LookUpCodeValues.SingleOrDefaultAsync(x => x.FKLookUpCodePKId == entity.FKLookUpCodePKId
        && x.Id != request.Id
        && x.LookUpValue == request.LookUpValue);
        if (existingItem != null)
        {
            throw new ConflictException(string.Format(ErrorMessages.ItemAlreadyExists, request.LookUpValue));
        }

        entity.LookUpValue = request.LookUpValue;
        entity.DisplayOrder = request.DisplayOrder;
        entity.IsActive = request.IsActive;
        _applicationDbContext.LookUpCodeValues.Update(entity);

        await _applicationDbContext.SaveChangesAsync();

        return SuccessMessages.RecordUpdatedSuccessfully;
    }

    public async Task<ViewLookUpCodeValuesResponse> GetLookUpCodeValueByIdAsync(int id)
    {
        var entity = await _applicationDbContext.LookUpCodeValues.SingleOrDefaultAsync(x => x.Id == id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Item"));

        return entity.Adapt<ViewLookUpCodeValuesResponse>();
    }
}
