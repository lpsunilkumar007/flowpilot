using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Nexus.Localization.Models.Request;
public class CreateCountryRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string CountryName { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string CountryCode { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required int DisplayOrder { get; set; }

}
