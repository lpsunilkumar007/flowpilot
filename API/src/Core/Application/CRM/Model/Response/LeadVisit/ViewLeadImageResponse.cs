namespace FlowPilot.Application.CRM.Model.Response.LeadVisit;

public class ViewLeadImageResponse
{
    public DefaultIdType Id { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    public string? Caption { get; set; }
}
