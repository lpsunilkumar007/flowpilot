namespace FlowPilot.Application.Nexus.Subscription.Models;
public class AssignSubscriptionPlanDto
{
    public required Guid TenantUniqueId { get; set; }

    public DefaultIdType SubscriptionPlanId { get; set; }

    public required bool IsDefaultViaRegistration { get; set; }

    public string? StripeSubscriptionId { get; set; }

    public string? StripeSubscriptionSchedulerId { get; set; }

    public string? StripePriceId { get; set; }

    public string? StripeJsonPayload { get; set; }
}
