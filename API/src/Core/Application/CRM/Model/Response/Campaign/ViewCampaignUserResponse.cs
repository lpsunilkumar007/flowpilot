namespace FlowPilot.Application.CRM.Model.Response.Campaign;

public class ViewCampaignUserResponse
{
    public DefaultIdType Id { get; set; }

    public DefaultIdType UserId { get; set; }

    public string Contact { get; set; } = string.Empty;
}
