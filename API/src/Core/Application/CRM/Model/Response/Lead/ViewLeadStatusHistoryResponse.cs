using FlowPilot.Domain.Enums.CRM;

namespace FlowPilot.Application.CRM.Model.Response.Lead;

public class ViewLeadStatusHistoryResponse
{
    public DefaultIdType Id { get; set; }

    public LeadStatus? FromStatus { get; set; }

    public LeadStatus ToStatus { get; set; }

    public string ChangedByUserId { get; set; } = string.Empty;

    public DateTimeOffset ChangedOn { get; set; }

    public string? Remarks { get; set; }
}
