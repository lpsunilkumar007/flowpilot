using FlowPilot.Application.Common.Models;

namespace FlowPilot.Application.CRM.Model.Request.Campaign;

public class SearchCampaignLeadsRequest : SearchRequestBaseClass
{
    public string? SearchText { get; set; }
}
