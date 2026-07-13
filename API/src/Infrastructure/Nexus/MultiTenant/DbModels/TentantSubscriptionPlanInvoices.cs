using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using FlowPilot.Domain.Common.Contracts;

namespace FlowPilot.Infrastructure.Nexus.MultiTenant.DbModels;
public class TentantSubscriptionPlanInvoices : AuditableEntity
{

    [Required]
    [ForeignKey(nameof(TentantSubscriptionPlans))]
    public required DefaultIdType FkTentantSubscriptionPlanPKId { get; set; }

    public TentantSubscriptionPlan TentantSubscriptionPlans { get; set; }

    public required DateTime PeriodFrom { get; set; }

    public required DateTime PeriodTo { get; set; }

    public string? StripeInvoiceId { get; set; }

    public required string StripePaymentStatus { get; set; }

    public string? StripeJsonPayload {  get; set; }

    public required string StripeInvoiceUrl { get; set; }
}
