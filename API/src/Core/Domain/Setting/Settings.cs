using FlowPilot.Domain.Enums;

namespace FlowPilot.Domain.Setting;
public class Settings : AuditableEntity
{
    public required SettingTypes SettingType { get; set; }

    public string? Description { get; set; }

    public required string OriginalValue { get; set; }

    public required string SettingValues { get; set; }
}
