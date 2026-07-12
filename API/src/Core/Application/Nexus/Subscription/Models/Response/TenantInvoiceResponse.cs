namespace FlowPilot.Application.Nexus.Subscription.Models.Response;
public class TenantInvoicesResponse
{
    public required DefaultIdType InvoiceId { get; set; }

    public required DateTime PeriodFrom { get; set; }

    public required DateTime PeriodTo { get; set; }

    public required string InvoiceStatus { get; set; }

    public required string StripeInvoiceUrl { get; set; }
}
