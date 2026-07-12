namespace FlowPilot.Application.ExternalIntegrations.Stripe.Models;
public class StripePaymentInitializationDto
{
    public required bool IsOneTimePayment { get; set; }

    public required string StripePayload { get; set; }

    public required string TransKeyId { get; set; }
}
