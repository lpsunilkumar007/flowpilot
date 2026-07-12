using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.Email.Model.Response.EmailTemplate;
public class ViewEmailTemplateResponse
{
    [Required]
    public required DefaultIdType Id { get; set; }

    [Required]
    public required string Name { get; set; }

    public string? Description { get; set; }

    [Required]
    public required EmailTemplateUsedFor TemplateUsedFor { get; set; }

    [Required]
    public required string EmailSubject { get; set; }

    [Required]
    public required bool IsShared { get; set; }
}