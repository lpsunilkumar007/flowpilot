using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.CRM;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.CRM.Model.Request.Lead;

public class CreateLeadRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string BusinessName { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string BusinessType { get; set; }

    public string? CurrentPOS { get; set; }

    public string? Website { get; set; }

    public string? GstNumber { get; set; }

    public string? Pan { get; set; }

    public int? NumberOfOutlets { get; set; }

    public decimal? ExpectedMonthlyBilling { get; set; }

    public decimal? ExpectedRevenue { get; set; }

    public string? CompanySize { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DefaultIdType OfferingId { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string OwnerName { get; set; }

    public string? Designation { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string Mobile { get; set; }

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

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DefaultIdType LeadSourceId { get; set; }

    public bool AssignToYourself { get; set; }

    public string? AssignedToUserId { get; set; }

    public LeadPriority Priority { get; set; } = LeadPriority.Medium;

    public DefaultIdType? LeadStatusId { get; set; }

    public DateTimeOffset? ExpectedClosingDate { get; set; }

    public InterestLevel InterestLevel { get; set; } = InterestLevel.Medium;

    public string? Notes { get; set; }

    public string? PainPoints { get; set; }

    public string? Competitors { get; set; }

    public string? Requirements { get; set; }
}
