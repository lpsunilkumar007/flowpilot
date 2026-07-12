using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Nexus.Localization.Models.Request;
public class UpdateCountryLocalizationRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DefaultIdType Id { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string Key { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string Value { get; set; }
}
