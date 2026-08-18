using FlowPilot.Domain.Enums.CRM;

namespace FlowPilot.Application.CRM.Model.Response.Campaign;

public class ViewCampaignDetailResponse
{
    public DefaultIdType Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public CampaignType CampaignType { get; set; }

    public DefaultIdType TemplateId { get; set; }

    public string TemplateName { get; set; } = string.Empty;

    public DateTimeOffset ScheduleDate { get; set; }

    public string? Message { get; set; }

    public DateTimeOffset CreatedOn { get; set; }

    public List<ViewCampaignUserResponse> CampaignUsers { get; set; } = [];
}
