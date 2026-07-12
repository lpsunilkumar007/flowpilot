using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.FormDesigner;

namespace FlowPilot.Application.FormDesigner.Model.Response.FormPageFields;
public class ViewFormPageFieldDetailResponse
{
    [Required]
    public required DefaultIdType Id { get; set; }

    [Required]
    public required DefaultIdType FKFormPagePKId { get; set; }

    [Required]
    public DefaultIdType? FKFormPageFieldTabId { get; set; }

    [Required]
    public required FormPageFieldTypes FormPageFieldType { get; set; }

    [Required]
    public required string Label { get; set; }

    [Required]
    public required Guid FieldKey { get; set; }

    [Required]
    public required int DisplayOrder { get; set; }

    [Required]
    public required List<ViewFormPageFieldOptionsResponse> FormPageFieldOptions { get; set; } = new();
}
