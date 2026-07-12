using System.ComponentModel.DataAnnotations.Schema;

namespace FlowPilot.Domain.CRM;

public class LeadContacts : AuditableEntity
{
    [ForeignKey(nameof(Lead))]
    public DefaultIdType FKLeadPKId { get; set; }

    public required string OwnerName { get; set; }

    public string? Designation { get; set; }

    public required string Mobile { get; set; }

    public string? WhatsApp { get; set; }

    public string? Email { get; set; }

    public string? AlternatePhone { get; set; }

    public bool IsPrimary { get; set; } = true;

    public virtual Leads Lead { get; set; } = null!;
}
