namespace FlowPilot.Application.CRM.Model.Response.Lead;

public class ViewLeadStatusHistoryResponse
{
    public DefaultIdType Id { get; set; }

    public DefaultIdType? FromStatusId { get; set; }

    public string? FromStatusName { get; set; }

    public DefaultIdType ToStatusId { get; set; }

    public string ToStatusName { get; set; } = string.Empty;

    public string ChangedByUserId { get; set; } = string.Empty;

    public DateTimeOffset ChangedOn { get; set; }

    public string? Remarks { get; set; }
}
