using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.Nexus.Subscription;

namespace FlowPilot.Application.Nexus.Subscription.Models.Response;
public class GetSubscriptionPlanDetailsResponse
{
    [Required]
    public required DefaultIdType Id { get; set; }

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

    public string? RibbonText { get; set; }

    [Required]
    public required bool IsDefaultForRegistration { get; set; }
}
