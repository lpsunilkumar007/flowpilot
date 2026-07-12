using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.LookUp.Models.Request;
public class UpdateLookUpCodeValueRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public int Id { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string LookUpValue { get; set; }
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]

    public required int DisplayOrder { get; set; }
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required bool IsActive { get; set; }
}
