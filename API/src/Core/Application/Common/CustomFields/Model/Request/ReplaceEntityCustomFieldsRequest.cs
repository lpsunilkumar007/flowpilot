using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.Common;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Common.CustomFields.Model.Request;

public class ReplaceEntityCustomFieldsRequest
{
    [Required]
    [EnumDataType(typeof(EntityCustomFieldType), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required EntityCustomFieldType EntityType { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DefaultIdType EntityId { get; set; }

    public List<EntityCustomFieldItemRequest> Fields { get; set; } = new();
}
