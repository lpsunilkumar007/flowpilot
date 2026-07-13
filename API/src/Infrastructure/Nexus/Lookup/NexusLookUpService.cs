using FlowPilot.Application.Common.Caching;
using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Models;
using FlowPilot.Application.Common.Models.Response;
using FlowPilot.Application.Nexus.LookUp;
using FlowPilot.Application.Nexus.LookUp.Models.Request;
using FlowPilot.Application.Nexus.LookUp.Models.Response;
using FlowPilot.Domain.Enums.Nexus;
using FlowPilot.Infrastructure.Nexus.LookUp.DbModels;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Infrastructure.Persistence.Context.Nexus;
using FlowPilot.Infrastructure.SystemConstants;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Nexus.LookUp;
public class NexusLookUpService : INexusLookUpService
{
    private const string CacheObjectId = "NexusLookUpCodeValues";
    private readonly NexusDbContext _nexusDbContext;
    private readonly ICacheService _cache;
    private readonly ICacheKeyService _cacheKeys;

    public NexusLookUpService(NexusDbContext nexusDbContext, ICacheService cache, ICacheKeyService cacheKeys)
    {
        _nexusDbContext = nexusDbContext;
        _cache = cache;
        _cacheKeys = cacheKeys;
    }

    private async Task<List<NexusLookUpCodeValues>> GetNexusLookUpCodeValuesAsync()
    {
        return await _nexusDbContext.NexusLookUpCodeValues
            .Include(x => x.NexusLookUpCode)
            .ToListAsync();
    }

    private async Task<List<NexusLookUpCodeValues>> GetCachedNexusLookUpCodeValuesAsync(bool clearAndRefill = false)
    {
        return await _cache.GetOrSetAsync(_cacheKeys.GetCacheKey(CacheKeys.NexusLookUpValuesByCode, CacheObjectId, false), GetNexusLookUpCodeValuesAsync, clearAndRefill: clearAndRefill);
    }

    public async Task<List<DropDownItemResponse>> GetNexusLookUpValuesByCodeForDropDownAsync(NexusLookUpCodeTypes type)
    {
        var result = await GetCachedNexusLookUpCodeValuesAsync();

        return result
            .Where(x => x.NexusLookUpCode.LookUpCodeType == type)
            .OrderBy(x => x.DisplayOrder)
            .ThenBy(x => x.LookUpValue)
            .Select(x => new DropDownItemResponse { Text = x.LookUpValue, Value = x.Id })
            .ToList();
    }

    public async Task<List<ViewNexusLookUpsResponse>> GetLookUpCodesAsync()
    {
        var result = await _nexusDbContext.NexusLookUpCodes.ToListAsync();
        return result.Adapt<List<ViewNexusLookUpsResponse>>();
    }

    public async Task<PaginationResponse<ViewNexusLookUpCodeValuesResponse>> GetLookUpCodeValuesAsync(SearchNexusLookUpCodeValuesRequest request)
    {
        var query = _nexusDbContext.NexusLookUpCodeValues.Where(x => x.NexusLookUpCode.LookUpCodeType == request.Type);

        if (!string.IsNullOrEmpty(request.sortField))
        {
            query = query.ApplySorting(sortField: request.sortField, sortOrder: request.sortOrder, ["LookUpValue", "DisplayOrder", "IsActive", "IsDefault"], "DisplayOrder");
        }

        return await query.PaginatedListAsync<NexusLookUpCodeValues, ViewNexusLookUpCodeValuesResponse>(request.PageNumber, request.PageSize);

    }

    public async Task<string> CreateLookUpCodeValueAsync(CreateNexusLookUpCodeValueRequest request)
    {
        var existingItem = await _nexusDbContext.NexusLookUpCodeValues.SingleOrDefaultAsync(x => x.FKNexusLookUpCodePKId == request.LookUpCodeId && x.LookUpValue == request.LookUpValue);
        if (existingItem != null)
        {
            throw new ConflictException(string.Format(ErrorMessages.ItemAlreadyExists, request.LookUpValue));
        }

        if (request.IsDefault)
        {
            var oldDefaultValues = await _nexusDbContext.NexusLookUpCodeValues.Where(x => x.FKNexusLookUpCodePKId == request.LookUpCodeId && x.IsDefault == true).ToListAsync();
            oldDefaultValues.ForEach(x =>
            {
                x.IsDefault = false;
            });

            _nexusDbContext.NexusLookUpCodeValues.UpdateRange(oldDefaultValues);
        }

        await _nexusDbContext.NexusLookUpCodeValues.AddAsync(new NexusLookUpCodeValues
        {
            LookUpValue = request.LookUpValue,
            DisplayOrder = request.DisplayOrder,
            FKNexusLookUpCodePKId = request.LookUpCodeId,
            IsActive = request.IsActive,
            IsDefault = request.IsDefault,
        });

        await _nexusDbContext.SaveChangesAsync();
        _ = await GetCachedNexusLookUpCodeValuesAsync(true);
        return SuccessMessages.RecordAddedSuccessfully;
    }

    public async Task<string> UpdateLookUpCodeValueAsync(UpdateNexusLookUpCodeValueRequest request)
    {
        var entity = await _nexusDbContext.NexusLookUpCodeValues.SingleOrDefaultAsync(x => x.Id == request.Id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Item"));

        var existingItem = await _nexusDbContext.NexusLookUpCodeValues.SingleOrDefaultAsync(x => x.FKNexusLookUpCodePKId == entity.FKNexusLookUpCodePKId
        && x.Id != request.Id
        && x.LookUpValue == request.LookUpValue);
        if (existingItem != null)
        {
            throw new ConflictException(string.Format(ErrorMessages.ItemAlreadyExists, request.LookUpValue));
        }

        if (request.IsDefault)
        {
            var oldDefaultValues = await _nexusDbContext.NexusLookUpCodeValues.Where(x => x.FKNexusLookUpCodePKId == entity.FKNexusLookUpCodePKId && x.IsDefault == true).ToListAsync();
            oldDefaultValues.ForEach(x =>
            {
                x.IsDefault = false;
            });

            _nexusDbContext.NexusLookUpCodeValues.UpdateRange(oldDefaultValues);
        }

        entity.LookUpValue = request.LookUpValue;
        entity.DisplayOrder = request.DisplayOrder;
        entity.IsActive = request.IsActive;
        entity.IsDefault = request.IsDefault;
        _nexusDbContext.NexusLookUpCodeValues.Update(entity);

        await _nexusDbContext.SaveChangesAsync();
        _ = await GetCachedNexusLookUpCodeValuesAsync(true);

        return SuccessMessages.RecordUpdatedSuccessfully;
    }

    public async Task<ViewNexusLookUpCodeValuesResponse> GetLookUpCodeValueByIdAsync(int id)
    {
        var entity = await _nexusDbContext.NexusLookUpCodeValues.SingleOrDefaultAsync(x => x.Id == id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Item"));

        return entity.Adapt<ViewNexusLookUpCodeValuesResponse>();
    }

    public async Task<ViewNexusLookUpCodeValuesResponse> GetLookUpCodeDefaultValueByCode(NexusLookUpCodeTypes type)
    {
        var cachedData = await GetCachedNexusLookUpCodeValuesAsync();

        var result = cachedData
            .Where(x => x.NexusLookUpCode.LookUpCodeType == type)
            .OrderBy(x => x.DisplayOrder)
            .ThenBy(x => x.LookUpValue)
            .First();

        return result.Adapt<ViewNexusLookUpCodeValuesResponse>();
    }
}
