namespace FlowPilot.Application.CRM.Model.Response.Campaign;

public class ViewCampaignLeadPickerResponse
{
    public DefaultIdType Id { get; set; }

    public string BusinessName { get; set; } = string.Empty;

    public string OwnerName { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string Mobile { get; set; } = string.Empty;
}
