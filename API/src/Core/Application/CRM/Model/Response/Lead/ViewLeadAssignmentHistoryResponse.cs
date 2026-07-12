namespace FlowPilot.Application.CRM.Model.Response.Lead;

public class ViewLeadAssignmentHistoryResponse
{
    public DefaultIdType Id { get; set; }

    public string? FromUserId { get; set; }

    public string ToUserId { get; set; } = string.Empty;

    public string AssignedByUserId { get; set; } = string.Empty;

    public DateTimeOffset AssignedOn { get; set; }

    public string? Remarks { get; set; }
}
