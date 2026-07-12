using FlowPilot.Application.Setting.Models;
using FlowPilot.Application.Setting.Models.Request;
using FlowPilot.Application.Setting.Models.Response;

namespace FlowPilot.Application.Setting;
public interface ISettingService : ITransientService
{
    Task<List<ViewSettingResponse>> GetSettingsAsync();

    Task<ViewSettingResponse> GetById(int id);

    Task<ViewSettingDetailResponse<T>> GetSettingByIdAsync<T>(int id);

    Task<string> UpdateSettings(UpdateSettingsRequest request);

    Task<T> GetSettingByCodeAsync<T>(SettingTypes settingType);

    Task<ViewSettingValuesDto> GetSettingByCodeAsync(SettingTypes settingType);
}