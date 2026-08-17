using FlowPilot.Application.Common.Notes.Model.Response;
using FlowPilot.Application.CRM.Model.Response.LeadActivity;
using FlowPilot.Domain.Enums.CRM;

namespace FlowPilot.Application.CRM.Model.Response.Lead;

public class ViewLeadDetailResponse
{
    public DefaultIdType Id { get; set; }

    public string BusinessName { get; set; } = string.Empty;

    public string BusinessType { get; set; } = string.Empty;

    public string? CurrentPOS { get; set; }

    public string? Website { get; set; }

    public string? GstNumber { get; set; }

    public string? Pan { get; set; }

    public int? NumberOfOutlets { get; set; }

    public decimal? ExpectedMonthlyBilling { get; set; }

    public decimal? ExpectedRevenue { get; set; }

    public string? CompanySize { get; set; }

    public DefaultIdType? OfferingId { get; set; }

    public string OfferingName { get; set; } = "Unassigned";

    public string OwnerName { get; set; } = string.Empty;

    public string? Designation { get; set; }

    public string Mobile { get; set; } = string.Empty;

    public string? WhatsApp { get; set; }

    public string? Email { get; set; }

    public string? AlternatePhone { get; set; }

    public string? Country { get; set; }

    public string? State { get; set; }

    public string? City { get; set; }

    public string? Area { get; set; }

    public string? Pincode { get; set; }

    public string? FullAddress { get; set; }

    public string? GoogleMapsLink { get; set; }

    public string? PlaceId { get; set; }

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    public DefaultIdType LeadSourceId { get; set; }

    public string LeadSourceName { get; set; } = string.Empty;

    public string? AssignedToUserId { get; set; }

    public LeadPriority Priority { get; set; }

    public DefaultIdType LeadStatusId { get; set; }

    public string LeadStatusName { get; set; } = string.Empty;

    public DateTimeOffset? ExpectedClosingDate { get; set; }

    public InterestLevel InterestLevel { get; set; }

    public string? PainPoints { get; set; }

    public string? Competitors { get; set; }

    public string? Requirements { get; set; }

    public DateTimeOffset? LastActivityDate { get; set; }

    public DateTimeOffset? NextFollowUpDate { get; set; }

    public bool IsArchived { get; set; }

    public DateTimeOffset? ConvertedOn { get; set; }

    public int? FKConvertedCustomerId { get; set; }

    public DateTimeOffset CreatedOn { get; set; }

    public List<ViewLeadActivityResponse> Activities { get; set; } = [];

    public List<ViewLeadFollowUpResponse> FollowUps { get; set; } = [];

    public List<ViewEntityNoteResponse> Notes { get; set; } = [];

    public List<ViewLeadStatusHistoryResponse> StatusHistories { get; set; } = [];

    public List<ViewLeadAssignmentHistoryResponse> AssignmentHistories { get; set; } = [];
}
