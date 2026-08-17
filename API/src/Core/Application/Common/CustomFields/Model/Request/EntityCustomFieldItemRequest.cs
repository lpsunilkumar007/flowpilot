using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Common.CustomFields.Model.Request;

public class EntityCustomFieldItemRequest
{
    public DefaultIdType? Id { get; set; }

    [MaxLength(100, ErrorMessage = ValidationMessages.LengthMessage)]
    public string? Label { get; set; }

    [MaxLength(500, ErrorMessage = ValidationMessages.LengthMessage)]
    public string? Value { get; set; }

    public int DisplayOrder { get; set; }
}
