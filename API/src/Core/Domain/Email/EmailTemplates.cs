using FlowPilot.Domain.Enums;

namespace FlowPilot.Domain.Email;
public class EmailTemplates : AuditableEntity
{
    public required string Name { get; set; }

    public string? Description { get; set; }

    public required EmailTemplateUsedFor TemplateUsedFor { get; set; }

    public required string EmailSubject { get; set; }

    public required string EmailBody { get; set; }

    public required bool IsShared { get; set; }

}
