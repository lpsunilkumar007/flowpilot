using FlowPilot.Application.Setting;
using FlowPilot.Application.Setting.Models;
using FlowPilot.Application.Setting.Models.Request;
using FlowPilot.Application.Setting.Models.Response;
using FlowPilot.Host.Controllers.BaseControllers;

namespace FlowPilot.Host.Controllers.Setting;

public class SettingsController : VersionNeutralApiController
{
    public readonly ISettingService _settingService;

    public SettingsController(ISettingService settingService)
    {
        _settingService = settingService;
    }

    [HttpGet("get-settings")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageSettings)]
    [OpenApiOperation("Retrieve all settings", "")]
    public async Task<List<ViewSettingResponse>> GetSettings()
    {
        return await _settingService.GetSettingsAsync();
    }

    [HttpPut("update-setting")]
    [MustHavePermission(SystemAction.Update, SystemResource.ManageSettings)]
    [OpenApiOperation("Update setting details", "")]
    public async Task<string> UpdateSettings(UpdateSettingsRequest request)
    {
        return await _settingService.UpdateSettings(request);
    }

    [HttpGet("get-appointment-settings")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageSettings)]
    [OpenApiOperation("Get Appointment Settings", "")]
    public async Task<AppointmentSettingModels> GetAppointmentSettings()
    {
        return await _settingService.GetSettingByCodeAsync<AppointmentSettingModels>(Domain.Enums.SettingTypes.Appointment);
    }


    [HttpGet("get-approved-appointment-settings")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageSettings)]
    [OpenApiOperation("Get Appointment Settings", "")]
    public async Task<ApprovedAppointmentSetting> GetApprovedAppointmentSettings()
    {
        return await _settingService.GetSettingByCodeAsync<ApprovedAppointmentSetting>(Domain.Enums.SettingTypes.ApprovedAppointment);
    }
}
