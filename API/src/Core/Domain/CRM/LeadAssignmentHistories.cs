using System.ComponentModel.DataAnnotations.Schema;

namespace FlowPilot.Domain.CRM;

public class LeadAssignmentHistories : AuditableEntity
{
    [ForeignKey(nameof(Lead))]
    public DefaultIdType FKLeadPKId { get; set; }

    public string? FromUserId { get; set; }

    public string? ToUserId { get; set; }

    public required string AssignedByUserId { get; set; }

    public required DateTimeOffset AssignedOn { get; set; }

    public string? Remarks { get; set; }

    public virtual Leads Lead { get; set; } = null!;
}
