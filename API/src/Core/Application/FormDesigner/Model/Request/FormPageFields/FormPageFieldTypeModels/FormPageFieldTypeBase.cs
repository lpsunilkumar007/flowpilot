using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.FormDesigner;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.FormDesigner.Model.Request.FormPageFields.FormPageFieldTypeModels;
public class FormPageFieldTypeBase
{
    public FormPageFieldTypeBase(FormPageFieldTypes formPageFieldType)
    {
        FormPageFieldType = formPageFieldType;
    }

    [Required]
    public required DefaultIdType Id { get; set; }

    [EnumDataType(typeof(FormPageFieldTypes), ErrorMessage = ValidationMessages.RequiredMessage)]
    public FormPageFieldTypes FormPageFieldType { get; set; }

    [Required]
    public required DefaultIdType FKFormPagePKId { get; set; }

    public DefaultIdType? FKFormPageFieldTabId { get; set; }


    public string Label { get; set; }

    public int DisplayOrder { get; set; }

    public required Guid FieldKey { get; set; }
}
