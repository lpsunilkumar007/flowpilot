using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.FormDesigner;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.FormDesigner.Model.Request.FormStructure;
public class CreateFormStructureRequest
{
    [Required]
    public required string Name { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [EnumDataType(typeof(FormStatus), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required FormStatus FormStatus { get; set; }

    public string? Description { get; set; }

    public string? IntroductionText { get; set; }
}
