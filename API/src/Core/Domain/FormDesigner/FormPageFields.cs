using System.ComponentModel.DataAnnotations.Schema;
using FlowPilot.Domain.Enums.FormDesigner;

namespace FlowPilot.Domain.FormDesigner;
public class FormPageFields : AuditableEntity
{
    [ForeignKey(nameof(FormPage))]
    public required DefaultIdType FKFormPagePKId { get; set; }

    [ForeignKey(nameof(FormPageTab))]
    public DefaultIdType? FKFormPageFieldTabId { get; set; }

    public required FormPageFieldTypes FormPageFieldType { get; set; }

    public required string Label { get; set; }

    public required Guid FieldKey { get; set; }

    public required int DisplayOrder { get; set; }

    public required bool IsAdditionalCommentAllowed { get; set; }


    public FormPages FormPage { get; set; }

    public FormPageTabs? FormPageTab { get; set; }

    public List<FormPageFieldOptions> FormPageFieldOptions { get; set; } = new();

}

