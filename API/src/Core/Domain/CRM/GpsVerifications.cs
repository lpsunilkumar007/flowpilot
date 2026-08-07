using System.ComponentModel.DataAnnotations.Schema;
using FlowPilot.Domain.Enums.CRM;

namespace FlowPilot.Domain.CRM;

public class GpsVerifications : AuditableEntity
{
    [ForeignKey(nameof(GpsLog))]
    public DefaultIdType FKGpsLogPKId { get; set; }

    public decimal? DistanceMeters { get; set; }

    public VerificationStatus Status { get; set; }

    public virtual GpsLogs GpsLog { get; set; } = null!;
}
