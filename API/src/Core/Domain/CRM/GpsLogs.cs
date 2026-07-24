using System.ComponentModel.DataAnnotations.Schema;

namespace FlowPilot.Domain.CRM;

public class GpsLogs : AuditableEntity
{
    [ForeignKey(nameof(Visit))]
    public DefaultIdType FKLeadVisitPKId { get; set; }

    public decimal Latitude { get; set; }

    public decimal Longitude { get; set; }

    public DateTimeOffset LoggedAt { get; set; }

    public virtual LeadVisits Visit { get; set; } = null!;

    public GpsVerifications? Verification { get; set; }
}
