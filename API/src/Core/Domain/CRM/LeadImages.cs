using System.ComponentModel.DataAnnotations.Schema;

namespace FlowPilot.Domain.CRM;

public class LeadImages : AuditableEntity
{
    [ForeignKey(nameof(Visit))]
    public DefaultIdType FKLeadVisitPKId { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    public string? Caption { get; set; }

    public virtual LeadVisits Visit { get; set; } = null!;
}
