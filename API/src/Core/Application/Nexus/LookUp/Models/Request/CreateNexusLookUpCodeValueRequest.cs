using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Nexus.LookUp.Models.Request;
public class CreateNexusLookUpCodeValueRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string LookUpValue { get; set; }
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required int DisplayOrder { get; set; }

    public int LookUpCodeId { get; set; }

    public required bool IsActive { get; set; }

    public required bool IsDefault { get; set; }
}
