using FlowPilot.Domain.Enums.CRM;

namespace FlowPilot.Application.CRM.Model.Response.Lead;

public class ViewLeadListResponse
{
    public DefaultIdType Id { get; set; }

    public string BusinessName { get; set; } = string.Empty;

    public string OwnerName { get; set; } = string.Empty;

    public string Mobile { get; set; } = string.Empty;

    public string BusinessType { get; set; } = string.Empty;

    public string? CurrentPOS { get; set; }

    public string AssignedToUserId { get; set; } = string.Empty;

    public LeadStatus LeadStatus { get; set; }

    public DateTimeOffset? NextFollowUpDate { get; set; }

    public DateTimeOffset? LastActivityDate { get; set; }

    public decimal? ExpectedRevenue { get; set; }

    public DateTimeOffset CreatedOn { get; set; }

    public InterestLevel InterestLevel { get; set; }

    public bool IsArchived { get; set; }
}
