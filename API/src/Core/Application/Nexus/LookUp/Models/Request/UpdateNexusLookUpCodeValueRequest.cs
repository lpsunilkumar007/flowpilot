using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Nexus.LookUp.Models.Request;
public class UpdateNexusLookUpCodeValueRequest
{
    public DefaultIdType Id { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string LookUpValue { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required int DisplayOrder { get; set; }

    public required bool IsActive { get; set; }

    public required bool IsDefault { get; set; }
}
