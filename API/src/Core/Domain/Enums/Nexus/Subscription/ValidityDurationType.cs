using System.ComponentModel;

namespace FlowPilot.Domain.Enums.Nexus.Subscription;
public enum ValidityDurationType
{
    [Description("Days")]
    Days = 1,
    [Description("Months")]
    Months = 2,
    [Description("Years")]
    Years = 3
}
