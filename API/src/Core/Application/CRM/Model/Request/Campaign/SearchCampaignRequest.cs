using FlowPilot.Application.Common.Models;
using FlowPilot.Domain.Enums.CRM;

namespace FlowPilot.Application.CRM.Model.Request.Campaign;

public class SearchCampaignRequest : SearchRequestBaseClass
{
    public string? SearchText { get; set; }

    public CampaignType? CampaignType { get; set; }
}
