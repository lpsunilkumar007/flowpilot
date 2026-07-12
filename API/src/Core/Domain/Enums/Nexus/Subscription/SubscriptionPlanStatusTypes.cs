using System.ComponentModel;

namespace FlowPilot.Domain.Enums.Nexus.Subscription;
public enum SubscriptionPlanStatusTypes
{
    [Description("Deactive Subscription plan")]
    Deactive = 0,
    [Description("Active Subscription plan")]
    Active = 1
}
