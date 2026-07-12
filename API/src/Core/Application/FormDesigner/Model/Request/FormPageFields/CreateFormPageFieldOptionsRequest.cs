using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.FormDesigner.Model.Request.FormPageFields;
public class CreateFormPageFieldOptionsRequest
{
    public DefaultIdType? Id { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string Value { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string Text { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required int DisplayOrder { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required bool IsActive { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public bool IsDeleted { get; set; }
}
