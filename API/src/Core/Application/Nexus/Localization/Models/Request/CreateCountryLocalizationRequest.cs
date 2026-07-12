using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Nexus.Localization.Models.Request;
public class CreateCountryLocalizationRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DefaultIdType FKCountryId { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string Key { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string Value { get; set; }

}
