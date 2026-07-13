using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Common.Contracts;
using FlowPilot.Domain.Enums.Nexus.Subscription;
using FlowPilot.Infrastructure.Nexus.MultiTenant.DbModels;

namespace FlowPilot.Infrastructure.Nexus.Subscription.DbModels;
public class Subscriptions : AuditableEntity
{
    [Required]
    public required string Name { get; set; }

    public required double Price { get; set; } // 120

    public required ValidityDurationType ValidityDurationType { get; set; } // Year

    public required int ValidityDuration { get; set; } // 1

    public required string Description { get; set; }

    public string? RibbonText { get; set; }

    public required bool IsDefaultForRegistration { get; set; } // false

    public required SubscriptionPlanPaymentCycleTypes SubscriptionPlanPaymentCycleType { get; set; } // yearly

    public required int DisplayOrder { get; set; }

    public required SubscriptionPlanStatusTypes SubscriptionPlanStatusType { get; set; }

    public virtual List<Tenants> Tenants { get; set; }
}