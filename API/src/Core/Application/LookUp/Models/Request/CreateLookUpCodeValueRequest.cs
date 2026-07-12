using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.LookUp.Models.Request;
public class CreateLookUpCodeValueRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string LookUpValue { get; set; }
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required int DisplayOrder { get; set; }

    public int LookUpCodeId { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required bool IsActive { get; set; }
}
