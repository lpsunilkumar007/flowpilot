using System.ComponentModel.DataAnnotations.Schema;

namespace FlowPilot.Domain.CRM;

public class LeadVisits : AuditableEntity
{
    [ForeignKey(nameof(Lead))]
    public DefaultIdType FKLeadPKId { get; set; }

    public DateTimeOffset VisitTime { get; set; }

    public virtual Leads Lead { get; set; } = null!;

    public List<GpsLogs> GpsLogs { get; set; } = [];

    public List<LeadImages> Images { get; set; } = [];
}
