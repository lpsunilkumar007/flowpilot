using FlowPilot.Domain.Enums.Common;

namespace FlowPilot.Application.Common.CustomFields.Model.Response;

public class ViewEntityCustomFieldResponse
{
    public DefaultIdType Id { get; set; }

    public EntityCustomFieldType EntityType { get; set; }

    public DefaultIdType FKEntityPKId { get; set; }

    public string Label { get; set; } = string.Empty;

    public string Value { get; set; } = string.Empty;

    public int DisplayOrder { get; set; }
}
