using System.ComponentModel.DataAnnotations;
using FlowPilot.Application.Common.Models;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Nexus.Localization.Models.Request;
public class SearchCountryLocalizationRequest : SearchRequestBaseClass
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DefaultIdType CountryId { get; set; }
}
