using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Application.Setting;
using FlowPilot.Application.Setting.Models;
using FlowPilot.Application.Setting.Models.Request;
using FlowPilot.Application.Setting.Models.Response;
using FlowPilot.Domain.Enums;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Infrastructure.SystemConstants;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Orbit.Setting;
internal class SettingService : ISettingService
{
    private readonly ApplicationDbContext _applicationDbContext;
    private readonly ISerializerService _serializerService;

    public SettingService(ApplicationDbContext applicationDbContext, ISerializerService serializerService)
    {
        _applicationDbContext = applicationDbContext;
        _serializerService = serializerService;
    }

    public async Task<List<ViewSettingResponse>> GetSettingsAsync()
    {
        var result = await _applicationDbContext.Settings.ToListAsync();

        return result.ConvertAll(x => new ViewSettingResponse
        {
            Description = x.Description,
            Id = x.Id,
            SettingType = x.SettingType,
        });
    }

    public async Task<ViewSettingResponse> GetById(int id)
    {
        var entity = await _applicationDbContext.Settings.SingleOrDefaultAsync(x => x.Id == id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Item"));

        return new ViewSettingResponse
        {
            SettingType = entity.SettingType,
            Description = entity.Description,
            Id = entity.Id,
        };
    }

    public async Task<ViewSettingDetailResponse<T>> GetSettingByIdAsync<T>(int id)
    {
        var entity = await _applicationDbContext.Settings.SingleOrDefaultAsync(x => x.Id == id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Item"));

        switch (entity.SettingType)
        {

            default:
                throw new CustomNotImplementedException($"{entity.SettingType} not implemented");
        }
    }

    public async Task<string> UpdateSettings(UpdateSettingsRequest request)
    {
        var entity = await _applicationDbContext.Settings.SingleOrDefaultAsync(x => x.Id == request.Id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Item"));
        try
        {
            switch (entity.SettingType)
            {
                case Domain.Enums.SettingTypes.Appointment:
                    _ = _serializerService.Deserialize<AppointmentSettingModels>(request.SettingJson);
                    break;
                case Domain.Enums.SettingTypes.ApprovedAppointment:
                    _ = _serializerService.Deserialize<ApprovedAppointmentSetting>(request.SettingJson);
                    break;
                case Domain.Enums.SettingTypes.GoogleMapKey:
                    _ = _serializerService.Deserialize<string>(request.SettingJson);
                    break;
                default:
                    throw new CustomNotImplementedException($"{entity.SettingType} not implemented");
            }
        }
        catch
        {
            throw new BadRequestException(ErrorMessages.UpdateSettingsDeserializeCrash);
        }

        entity.SettingValues = request.SettingJson;
        _applicationDbContext.Settings.Update(entity);
        await _applicationDbContext.SaveChangesAsync();

        return SuccessMessages.RecordUpdatedSuccessfully;
    }

    public async Task<T> GetSettingByCodeAsync<T>(SettingTypes settingType)
    {
        var entity = await _applicationDbContext.Settings.SingleOrDefaultAsync(x => x.SettingType == settingType);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Item"));

        switch (entity.SettingType)
        {
            case SettingTypes.Appointment:
                return _serializerService.Deserialize<T>(entity.SettingValues);
            case SettingTypes.ApprovedAppointment:
                return _serializerService.Deserialize<T>(entity.SettingValues);
            case SettingTypes.GoogleMapKey:
                return _serializerService.Deserialize<T>(entity.SettingValues);
            default:
                throw new CustomNotImplementedException($"{entity.SettingType} not implemented");
        }
    }

    public async Task<ViewSettingValuesDto> GetSettingByCodeAsync(SettingTypes settingType)
    {
        var entity = await _applicationDbContext.Settings.SingleOrDefaultAsync(x => x.SettingType == settingType);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Item"));

        return new ViewSettingValuesDto
        {
            OriginalValue = entity.OriginalValue,
            SettingValues = entity.SettingValues,
        };
    }
}
