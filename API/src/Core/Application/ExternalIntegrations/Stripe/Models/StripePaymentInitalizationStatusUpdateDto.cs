using FlowPilot.Domain.Enums.ExternalIntegrations.Stripe;

namespace FlowPilot.Application.ExternalIntegrations.Stripe.Models;
public class StripePaymentInitializationStatusUpdateDto
{
    public required string TransKeyId { get; set; }

    public required StripePaymentStatus PaymentStatus { get; set; }

    public string? StripePaymentErrorPayload { get; set; }

    public string? StripePaymentSuccessPayload { get; set; }

    public string? StripeSubscriptionId { get; set; }

    public string? StripeInvoiceId { get; set; }
}
