using FlowPilot.Domain.Enums.Common;

namespace FlowPilot.Application.Common.Notes.Model.Response;

public class ViewEntityNoteResponse
{
    public DefaultIdType Id { get; set; }

    public EntityNoteType EntityNoteType { get; set; }

    public DefaultIdType FKEntityPKId { get; set; }

    public string NoteText { get; set; } = string.Empty;

    public DateTimeOffset CreatedOn { get; set; }
}
