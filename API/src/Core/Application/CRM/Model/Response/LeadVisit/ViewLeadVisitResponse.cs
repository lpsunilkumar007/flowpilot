namespace FlowPilot.Application.CRM.Model.Response.LeadVisit;

public class ViewLeadVisitResponse
{
    public DefaultIdType Id { get; set; }

    public DefaultIdType FKLeadPKId { get; set; }

    public DateTimeOffset VisitTime { get; set; }

    public DateTimeOffset CreatedOn { get; set; }

    public List<ViewGpsLogResponse> GpsLogs { get; set; } = [];

    public List<ViewLeadImageResponse> Images { get; set; } = [];
}
