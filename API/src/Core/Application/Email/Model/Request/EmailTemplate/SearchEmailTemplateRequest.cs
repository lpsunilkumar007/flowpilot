using System.ComponentModel.DataAnnotations;
using FlowPilot.Application.Common.Models;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Email.Model.Request.EmailTemplate;
public class SearchEmailTemplateRequest : SearchRequestBaseClass
{
    public string? NameDescription { get; set; }

    [EnumDataType(typeof(EmailTemplateUsedFor), ErrorMessage = ValidationMessages.RequiredMessage)]
    public EmailTemplateUsedFor? TemplateUsedFor { get; set; }

    public bool? IsShared { get; set; }
}
