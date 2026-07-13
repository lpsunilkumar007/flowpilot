using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Application.Nexus.Setting;
using FlowPilot.Application.Nexus.Setting.Models;
using FlowPilot.Domain.Enums.Nexus;

namespace FlowPilot.Infrastructure.Nexus.Setting;
public class NexusSettingService : INexusSettingService
{
    private readonly ISerializerService _serializerService;
    public NexusSettingService(ISerializerService serializerService)
    {
        _serializerService = serializerService;
    }

    public async Task<T> GetByCodeAsync<T>(NexusSettingTypes settingType)
    {
        switch (settingType)
        {
            case NexusSettingTypes.UserSettings:
                string temp = _serializerService.Serialize(new NexusUserSettingModel());
                return _serializerService.Deserialize<T>(temp);
            default:
                throw new NotImplementedException($"{settingType.ToString()} not implemented");
        }
    }
}
