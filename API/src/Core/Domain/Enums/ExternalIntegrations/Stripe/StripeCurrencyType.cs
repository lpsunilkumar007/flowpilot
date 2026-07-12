using System.ComponentModel;

namespace FlowPilot.Domain.Enums.ExternalIntegrations.Stripe;
public enum StripeCurrencyType
{
    [Description("usd")]
    USD = 0,
    [Description("inr")]
    INR = 1,
}
