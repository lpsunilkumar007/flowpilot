using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.CRM;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.CRM.Model.Request.Offering;

public class CreateOfferingRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string Name { get; set; }

    public OfferingType Type { get; set; } = OfferingType.Product;

    public OfferingStatus Status { get; set; } = OfferingStatus.Active;

    public string? Description { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string OwnerUserId { get; set; }

    public decimal? ExpectedValueFrom { get; set; }

    public decimal? ExpectedValueTo { get; set; }
}
