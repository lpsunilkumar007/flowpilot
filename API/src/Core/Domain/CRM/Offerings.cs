using FlowPilot.Domain.Enums.CRM;

namespace FlowPilot.Domain.CRM;

public class Offerings : AuditableEntity
{
    public Guid UniqueId { get; set; } = Guid.NewGuid();

    public required string Name { get; set; }

    public OfferingType Type { get; set; }

    public OfferingStatus Status { get; set; } = OfferingStatus.Active;

    public string? Description { get; set; }

    public required string FKOwnerUserId { get; set; }

    public decimal? ExpectedValueFrom { get; set; }

    public decimal? ExpectedValueTo { get; set; }

    public List<Leads> Leads { get; set; } = [];
}
