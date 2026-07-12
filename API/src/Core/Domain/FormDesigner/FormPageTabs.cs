using System.ComponentModel.DataAnnotations.Schema;

namespace FlowPilot.Domain.FormDesigner;
public class FormPageTabs : AuditableEntity
{
    [ForeignKey(nameof(FormPage))]
    public required DefaultIdType FKFormPagePKId { get; set; }

    [ForeignKey(nameof(ParentTab))]
    public DefaultIdType? FKFormPageTabPKId { get; set; }

    public required string Name { get; set; }

    public required int DisplayOrder { get; set; }

    public FormPages FormPage { get; set; } = null!;

    public FormPageTabs? ParentTab { get; set; }
    
    public List<FormPageTabs> ChildTabs { get; set; } = new();

    public List<FormPageFields> Fields { get; set; } = new();
}