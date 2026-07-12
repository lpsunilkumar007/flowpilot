using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.Nexus.Subscription.Models.Response;
public class TenantCurrentSubscriptionDetailResponse
{
    [Required]
    public required string Name { get; set; }

    [Required]
    public required double Price { get; set; }

    [Required]
    public required DateTimeOffset ExpiredOn { get; set; }

    public DateTime? PaymentPending { get; set; }

    public required bool IsOverDue { get; set; }

    [Required]
    public required DefaultIdType FKSubscriptionPlanPKId { get; set; }

    [Required]
    public required bool LatePaymentOverDue { get; set; }

    public required List<TenantInvoicesResponse> Invoices { get; set; }

}