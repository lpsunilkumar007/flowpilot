using System.ComponentModel.DataAnnotations.Schema;
using FlowPilot.Domain.Enums.CRM;

namespace FlowPilot.Domain.CRM;

public class LeadStatusHistories : AuditableEntity
{
    [ForeignKey(nameof(Lead))]
    public DefaultIdType FKLeadPKId { get; set; }

    public LeadStatus? FromStatus { get; set; }

    public required LeadStatus ToStatus { get; set; }

    public required string ChangedByUserId { get; set; }

    public required DateTimeOffset ChangedOn { get; set; }

    public string? Remarks { get; set; }

    public virtual Leads Lead { get; set; } = null!;
}
