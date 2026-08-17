using FlowPilot.Domain.Enums.Common;

namespace FlowPilot.Domain.Common;

public class EntityCustomFields : AuditableEntity
{
    public required EntityCustomFieldType EntityType { get; set; }

    public required DefaultIdType FKEntityPKId { get; set; }

    public required string Label { get; set; }

    public required string Value { get; set; }

    public int DisplayOrder { get; set; }
}
