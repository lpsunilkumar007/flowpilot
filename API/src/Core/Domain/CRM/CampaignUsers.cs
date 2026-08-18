using System.ComponentModel.DataAnnotations.Schema;

namespace FlowPilot.Domain.CRM;

public class CampaignUsers : AuditableEntity
{
    [ForeignKey(nameof(Campaign))]
    public DefaultIdType CampaignId { get; set; }

    public DefaultIdType UserId { get; set; }

    public required string Contact { get; set; }

    public virtual Campaigns Campaign { get; set; } = null!;
}
