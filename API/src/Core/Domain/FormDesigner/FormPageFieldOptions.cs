using System.ComponentModel.DataAnnotations.Schema;

namespace FlowPilot.Domain.FormDesigner;
public class FormPageFieldOptions : AuditableEntity
{
    [ForeignKey(nameof(FormPageField))]
    public DefaultIdType FKFormPageFieldPKId { get; set; }

    public FormPageFields FormPageField { get; set; } = null!;

    public required string Value { get; set; }

    public required string Text { get; set; }

    public required int DisplayOrder { get; set; }

    public required bool IsActive { get; set; }
}


