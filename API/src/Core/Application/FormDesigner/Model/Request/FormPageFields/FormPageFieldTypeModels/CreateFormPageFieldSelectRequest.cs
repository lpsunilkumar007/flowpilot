using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.FormDesigner;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.FormDesigner.Model.Request.FormPageFields.FormPageFieldTypeModels;
public class CreateFormPageFieldSelectRequest() : FormPageFieldTypeBase(FormPageFieldTypes.Select)
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required List<CreateFormPageFieldOptionsRequest> Options { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required bool IsAdditionalCommentAllowed { get; set; }
}

