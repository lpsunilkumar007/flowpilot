using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.ExternalIntegrations.Stripe;

namespace FlowPilot.Application.ExternalIntegrations.Stripe.Models.Request;
public class CreateIntentRequest
{
    [Required]
    public required StripeCurrencyType Currency { get; set; }

    [Required]
    public required DefaultIdType SubscriptionId { get; set; }
}
