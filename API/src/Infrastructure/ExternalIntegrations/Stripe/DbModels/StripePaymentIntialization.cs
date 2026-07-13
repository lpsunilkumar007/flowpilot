using FlowPilot.Domain.Common.Contracts;
using FlowPilot.Domain.Enums.ExternalIntegrations.Stripe;

namespace FlowPilot.Infrastructure.ExternalIntegrations.Stripe.DbModels;
public class StripePaymentInitialization : AuditableEntity
{
    public required string StripeRequestPayload { get; set; }

    public required string TransactionKeyId { get; set; }

    public required bool IsOneTimePayment { get; set; }

    public required StripePaymentStatus PaymentStatus { get; set; }

    public string? StripePaymentErrorPayload { get; set; }

    public string? StripePaymentSuccessPayload { get; set; }

    public string? StripeSubscriptionId { get; set; }

    public string? StripeInvoiceId { get; set; }
}
