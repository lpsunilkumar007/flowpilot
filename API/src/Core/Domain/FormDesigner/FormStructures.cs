using FlowPilot.Domain.Enums.FormDesigner;

namespace FlowPilot.Domain.FormDesigner;
public class FormStructures : AuditableEntity
{
    public required string Name { get; set; }

    public required FormStatus FormStatus { get; set; }

    public string? Description { get; set; }

    public string? IntroductionText { get; set; }

    public List<FormPages> FormPages { get; set; } = new();
}
