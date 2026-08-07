using System.ComponentModel.DataAnnotations.Schema;
using FlowPilot.Domain.Enums.CRM;
using FlowPilot.Domain.LookUp;

namespace FlowPilot.Domain.CRM;

public class Leads : AuditableEntity
{
    public required string BusinessName { get; set; }

    public required string BusinessType { get; set; }

    public string? CurrentPOS { get; set; }

    public string? Website { get; set; }

    public string? GstNumber { get; set; }

    public string? Pan { get; set; }

    public int? NumberOfOutlets { get; set; }

    public decimal? ExpectedMonthlyBilling { get; set; }

    public decimal? ExpectedRevenue { get; set; }

    public string? CompanySize { get; set; }

    [ForeignKey(nameof(LeadSource))]
    public required DefaultIdType FKLeadSourceId { get; set; }

    public required string FKAssignedToUserId { get; set; }

    public LeadPriority Priority { get; set; } = LeadPriority.Medium;

    [ForeignKey(nameof(LeadStatus))]
    public required DefaultIdType FKLeadStatusId { get; set; }

    public DateTimeOffset? ExpectedClosingDate { get; set; }

    public InterestLevel InterestLevel { get; set; } = InterestLevel.Medium;

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

    public string? PainPoints { get; set; }

    public string? Competitors { get; set; }

    public string? Requirements { get; set; }

    public DateTimeOffset? LastActivityDate { get; set; }

    public DateTimeOffset? NextFollowUpDate { get; set; }

    public bool IsArchived { get; set; }

    public DateTimeOffset? ConvertedOn { get; set; }

    public int? FKConvertedCustomerId { get; set; }

    public virtual LookUpCodeValues LeadSource { get; set; } = null!;

    public virtual LookUpCodeValues LeadStatus { get; set; } = null!;

    public List<LeadContacts> LeadContacts { get; set; } = [];

    public List<LeadActivities> LeadActivities { get; set; } = [];

    public List<LeadFollowUps> LeadFollowUps { get; set; } = [];

    public List<LeadStatusHistories> LeadStatusHistories { get; set; } = [];

    public List<LeadAssignmentHistories> LeadAssignmentHistories { get; set; } = [];
    public List<LeadVisits> LeadVisits { get; set; } = [];
}
