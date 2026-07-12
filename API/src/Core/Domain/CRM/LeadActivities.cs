using System.ComponentModel.DataAnnotations.Schema;
using FlowPilot.Domain.Enums.CRM;

namespace FlowPilot.Domain.CRM;

public class LeadActivities : AuditableEntity
{
    [ForeignKey(nameof(Lead))]
    public DefaultIdType FKLeadPKId { get; set; }

    public required LeadActivityType ActivityType { get; set; }

    public required DateTimeOffset ActivityDate { get; set; }

    public TimeSpan? ActivityTime { get; set; }

    public int? DurationMinutes { get; set; }

    public string? Outcome { get; set; }

    public string? Notes { get; set; }

    public DateTimeOffset? NextFollowUpDate { get; set; }

    public string? AttachmentUrl { get; set; }

    public virtual Leads Lead { get; set; } = null!;
}
