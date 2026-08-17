using FlowPilot.Domain.Enums.CRM;

namespace FlowPilot.Application.CRM.Model.Response.Offering;

public class ViewOfferingResponse
{
    public DefaultIdType Id { get; set; }

    public Guid UniqueId { get; set; }

    public string Name { get; set; } = string.Empty;

    public OfferingType Type { get; set; }

    public OfferingStatus Status { get; set; }

    public string? Description { get; set; }

    public string OwnerUserId { get; set; } = string.Empty;

    public decimal? ExpectedValueFrom { get; set; }

    public decimal? ExpectedValueTo { get; set; }

    public int LeadCount { get; set; }

    public DateTimeOffset CreatedOn { get; set; }
}
