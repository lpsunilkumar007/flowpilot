using FlowPilot.Domain.Enums.ExternalIntegrations.Stripe;

namespace FlowPilot.Application.ExternalIntegrations.Stripe.Models.Response;
public class GetPaymentStatusResponse
{
    public required StripePaymentStatus PaymentStatus { get; set; }

    public required decimal Amount { get; set; }

    public required string Currency { get;set; }
}
