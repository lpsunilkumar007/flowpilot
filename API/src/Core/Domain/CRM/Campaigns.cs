using System.ComponentModel.DataAnnotations.Schema;
using FlowPilot.Domain.Email;
using FlowPilot.Domain.Enums.CRM;

namespace FlowPilot.Domain.CRM;

public class Campaigns : AuditableEntity
{
    public required string Title { get; set; }

    public CampaignType CampaignType { get; set; } = CampaignType.Email;

    [ForeignKey(nameof(EmailTemplate))]
    public DefaultIdType TemplateId { get; set; }

    public DateTimeOffset ScheduleDate { get; set; }

    public string? Message { get; set; }

    public virtual EmailTemplates EmailTemplate { get; set; } = null!;

    public List<CampaignUsers> CampaignUsers { get; set; } = [];
}
