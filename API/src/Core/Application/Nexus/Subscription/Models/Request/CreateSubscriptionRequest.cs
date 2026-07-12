using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.Nexus.Subscription;

namespace FlowPilot.Application.Nexus.Subscription.Models.Request;
public class CreateSubscriptionRequest
{
    [Required]
    public required string Name { get; set; }

    [Required]
    public required double Price { get; set; }

    [Required]
    public required int ValidityDuration { get; set; }

    [Required]
    public required ValidityDurationType ValidityDurationType { get; set; }

    [Required]
    public required string Description { get; set; }

    [Required]
    public required int DisplayOrder { get; set; }

    [Required]
    public required SubscriptionPlanStatusTypes SubscriptionPlanStatusType { get; set; }

    public string? RibbonText { get; set; }

    [Required]
    public required SubscriptionPlanPaymentCycleTypes SubscriptionPlanPaymentCycleType { get; set; }

    [Required]
    public required bool IsDefaultForRegistration { get; set; }

}
