using System.ComponentModel.DataAnnotations.Schema;

namespace FlowPilot.Domain.FormDesigner;
public class FormPages : AuditableEntity
{
    [ForeignKey(nameof(FormStructure))]
    public required DefaultIdType FKFormStructurePKId { get; set; }

    public required string Title { get; set; }

    public string? Description { get; set; }

    public string? IntroText { get; set; }

    public required int DisplayOrder { get; set; }

    public virtual FormStructures FormStructure { get; set; } = null!;

    // Fields that are not inside a tab can have FKFormPageFieldTabId = null
    public List<FormPageFields> Fields { get; set; } = new();

    // Tabs for this page (supports nesting via self join)
    public List<FormPageTabs> Tabs { get; set; } = new();
}
