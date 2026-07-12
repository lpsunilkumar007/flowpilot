using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.FormDesigner.Model.Response.FormPageFields;
public class ViewFormPageFieldOptionsResponse
{
    [Required]
    public required DefaultIdType Id { get; set; }

    [Required]
    public DefaultIdType FKFormPageFieldPKId { get; set; }

    [Required]
    public required string Value { get; set; }

    [Required]
    public required string Text { get; set; }

    [Required]
    public required int DisplayOrder { get; set; }

    [Required]
    public required bool IsActive { get; set; }
}
