namespace FlowPilot.Application.CRM.Model.Response.LeadVisit;

public class UpdateLeadWithVisitResponse
{
    public DefaultIdType LeadId { get; set; }

    public DefaultIdType LeadVisitId { get; set; }

    public string Message { get; set; } = string.Empty;
}
