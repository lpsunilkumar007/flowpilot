using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using FlowPilot.Domain.Common.Contracts;
using FlowPilot.Domain.Enums.Nexus.Subscription;
using FlowPilot.Infrastructure.Nexus.Subscription.DbModels;

namespace FlowPilot.Infrastructure.Nexus.MultiTenant.DbModels;
public class TentantSubscriptionPlan : AuditableEntity
{
    [Required]
    [ForeignKey(nameof(Tenant))]
    public required DefaultIdType FkTenantPKId { get; set; }

    [Required]
    [ForeignKey(nameof(Subscription))]
    public required DefaultIdType FKSubscriptionPlanPKId { get; set; }

    [Required]
    public required string Name { get; set; }

    [Required]
    public required double Price { get; set; }

    [Required]
    public required ValidityDurationType ValidityDurationType { get; set; }

    public required string Description { get; set; }

    public required SubscriptionPlanPaymentCycleTypes SubscriptionPlanPaymentCycleType { get; set; } // yearly

    [Required]
    public required int ValidityDuration { get; set; }

    [Required]
    public required bool IsActive { get; set; }

    [Required]
    public required DateTimeOffset ExpiredOn { get; set; } 

    public virtual Tenants Tenant { get; set; }

    public required SubscriptionPlanPaymentStatus SubscriptionPlanPaymentStatus { get; set; }

    public string? StripePriceId { get; set; }

    // add new column to store stripe subcription id
    public string? StripeSubscriptionId { get; set; }

    public string? StripeSubscriptionSchedulerId { get; set; }

    public virtual Subscriptions Subscription { get; set; }

    public List<TentantSubscriptionPlanInvoices> TentantSubscriptionPlanInvoices { get; set; }
}


//public class TentantSubscriptionPlanInvoices : AuditableEntity
//{
//    [ForeignKey(nameof(TentantSubscriptionPlans))]
//    public required DefaultIdType FKTentantSubscriptionPlanId { get; set; }

//    public required string StripeInvoiceId { get; set; }

//    public required DateTime PaidDate { get; set; }

//    public string PaidStatus { get; set; }


//    public TentantSubscriptionPlan TentantSubscriptionPlans { get; set; }


//}