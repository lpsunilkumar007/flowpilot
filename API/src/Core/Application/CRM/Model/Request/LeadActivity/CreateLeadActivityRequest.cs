using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.CRM;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.CRM.Model.Request.LeadActivity;

public class CreateLeadActivityRequest
{
    [Required]
    public required LeadActivityType ActivityType { get; set; }

    [Required]
    public required DateTimeOffset ActivityDate { get; set; }

    public TimeSpan? ActivityTime { get; set; }

    public int? DurationMinutes { get; set; }

    public string? Outcome { get; set; }

    public string? Notes { get; set; }

    public DateTimeOffset? NextFollowUpDate { get; set; }

    public FollowUpType? FollowUpType { get; set; }

    public string? ReminderNote { get; set; }
}
