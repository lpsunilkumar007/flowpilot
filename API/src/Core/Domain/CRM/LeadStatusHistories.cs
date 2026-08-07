using System.ComponentModel.DataAnnotations.Schema;
using FlowPilot.Domain.LookUp;

namespace FlowPilot.Domain.CRM;

public class LeadStatusHistories : AuditableEntity
{
    [ForeignKey(nameof(Lead))]
    public DefaultIdType FKLeadPKId { get; set; }

    [ForeignKey(nameof(FromStatus))]
    public DefaultIdType? FKFromStatusId { get; set; }

    [ForeignKey(nameof(ToStatus))]
    public required DefaultIdType FKToStatusId { get; set; }

    public required string ChangedByUserId { get; set; }

    public required DateTimeOffset ChangedOn { get; set; }

    public string? Remarks { get; set; }

    public virtual Leads Lead { get; set; } = null!;

    public virtual LookUpCodeValues? FromStatus { get; set; }

    public virtual LookUpCodeValues ToStatus { get; set; } = null!;
}
