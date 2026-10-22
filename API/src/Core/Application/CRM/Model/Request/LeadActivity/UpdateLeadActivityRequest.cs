using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.CRM;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.CRM.Model.Request.LeadActivity;

public class UpdateLeadActivityRequest
{
    [Required]
    [EnumDataType(typeof(LeadActivityType), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required LeadActivityType ActivityType { get; set; }

    [Required]
    public required DateTimeOffset ActivityDate { get; set; }

    public int? DurationMinutes { get; set; }

    public string? Outcome { get; set; }

    public string? Notes { get; set; }

    public DateTimeOffset? NextFollowUpDate { get; set; }
}
