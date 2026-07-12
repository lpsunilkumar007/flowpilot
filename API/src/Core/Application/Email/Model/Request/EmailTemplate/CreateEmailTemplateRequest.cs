using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Email.Model.Request.EmailTemplate;
public class CreateEmailTemplateRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string Name { get; set; }

    public string? Description { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [EnumDataType(typeof(EmailTemplateUsedFor), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required EmailTemplateUsedFor TemplateUsedFor { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string EmailSubject { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string EmailBody { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required bool IsShared { get; set; }
}
