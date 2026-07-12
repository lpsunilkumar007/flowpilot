using System.ComponentModel.DataAnnotations.Schema;
using FlowPilot.Domain.Enums.CRM;

namespace FlowPilot.Domain.CRM;

public class LeadFollowUps : AuditableEntity
{
    [ForeignKey(nameof(Lead))]
    public DefaultIdType FKLeadPKId { get; set; }

    public required DateTimeOffset NextFollowUpDate { get; set; }

    public FollowUpType FollowUpType { get; set; } = FollowUpType.Call;

    public FollowUpStatus FollowUpStatus { get; set; } = FollowUpStatus.Pending;

    public string? ReminderNote { get; set; }

    public virtual Leads Lead { get; set; } = null!;
}
