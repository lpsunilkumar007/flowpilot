using FlowPilot.Domain.Enums.Nexus;

namespace FlowPilot.Application.Nexus.Setting;
public interface INexusSettingService : ITransientService
{
    Task<T> GetByCodeAsync<T>(NexusSettingTypes settingType);
}
