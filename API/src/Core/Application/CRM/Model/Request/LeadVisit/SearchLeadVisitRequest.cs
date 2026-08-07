using FlowPilot.Application.Common.Models;

namespace FlowPilot.Application.CRM.Model.Request.LeadVisit;

public class SearchLeadVisitRequest : SearchRequestBaseClass
{
    public DefaultIdType? FKLeadPKId { get; set; }
}
