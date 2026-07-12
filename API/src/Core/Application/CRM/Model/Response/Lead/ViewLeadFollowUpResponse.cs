using FlowPilot.Domain.Enums.CRM;

namespace FlowPilot.Application.CRM.Model.Response.Lead;

public class ViewLeadFollowUpResponse
{
    public DefaultIdType Id { get; set; }

    public DateTimeOffset NextFollowUpDate { get; set; }

    public FollowUpType FollowUpType { get; set; }

    public FollowUpStatus FollowUpStatus { get; set; }

    public string? ReminderNote { get; set; }
}
