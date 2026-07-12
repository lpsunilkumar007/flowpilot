using FlowPilot.Domain.Enums.Common;

namespace FlowPilot.Domain.Common;

public class EntityNotes : AuditableEntity
{
    public required EntityNoteType EntityNoteType { get; set; }

    public required DefaultIdType FKEntityPKId { get; set; }

    public required string NoteText { get; set; }
}
