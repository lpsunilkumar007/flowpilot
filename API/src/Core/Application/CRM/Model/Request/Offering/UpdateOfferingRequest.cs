using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.CRM;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.CRM.Model.Request.Offering;

public class UpdateOfferingRequest
{
    [Required]
    public required DefaultIdType Id { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string Name { get; set; }

    public OfferingType Type { get; set; }

    public OfferingStatus Status { get; set; }

    public string? Description { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string OwnerUserId { get; set; }

    public decimal? ExpectedValueFrom { get; set; }

    public decimal? ExpectedValueTo { get; set; }
}
