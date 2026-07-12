using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.Email.Model.Response.EmailTemplate;
public class ViewEmailTemplateDetailResponse
{
    [Required]
    public required string Name { get; set; }

    public string? Description { get; set; }

    [Required]
    public required EmailTemplateUsedFor TemplateUsedFor { get; set; }

    [Required]
    public required string EmailSubject { get; set; }

    [Required]
    public required string EmailBody { get; set; }

    [Required]
    public required bool IsShared { get; set; }
}