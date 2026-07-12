using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.Nexus.Subscription;

namespace FlowPilot.Application.Nexus.MultiTenant.Models.Response;
public class GetTenantSubscriptionResponse
{
    [Required]
    public required DefaultIdType TenantSubscriptionId { get; set; }

    [Required]
    public required string TenantSubscriptionName { get; set; }

    [Required]
    public required string TenantSubscriptionDescription { get; set; }

    [Required]
    public required ValidityDurationType ValidityDurationType { get; set; }

    [Required]
    public required int ValidityDuration { get; set; }

    public string? StripeSubscriptionId { get; set; }

    public string? StripeSubscriptionSchedulerId { get; set; }

    [Required]
    public required bool IsActive { get; set; }

    [Required]
    public required DateTimeOffset ExpiredOn { get; set; }

    [Required]
    public required double Price { get; set; }

    [Required]
    public required List<TenantSubscriptionInvoiceResponse> TenantSubscriptionInvoiceResponses { get; set; }
}

public class TenantSubscriptionInvoiceResponse
{

    public required DefaultIdType TenantSubscriptionInvoiceId { get; set; }

    public string? StripeInvoiceId { get; set; }

    public required DateTime PeriodFrom { get; set; }

    public required DateTime PeriodTo { get; set; }

    public required string StripePaymentStatus { get; set; }

}
