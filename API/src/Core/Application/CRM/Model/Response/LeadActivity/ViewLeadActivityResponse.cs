using FlowPilot.Domain.Enums.CRM;

namespace FlowPilot.Application.CRM.Model.Response.LeadActivity;

public class ViewLeadActivityResponse
{
    public DefaultIdType Id { get; set; }

    public DefaultIdType FKLeadPKId { get; set; }

    public LeadActivityType ActivityType { get; set; }

    public DateTimeOffset ActivityDate { get; set; }

    public TimeSpan? ActivityTime { get; set; }

    public int? DurationMinutes { get; set; }

    public string? Outcome { get; set; }

    public string? Notes { get; set; }

    public DateTimeOffset? NextFollowUpDate { get; set; }

    public DateTimeOffset CreatedOn { get; set; }
}
