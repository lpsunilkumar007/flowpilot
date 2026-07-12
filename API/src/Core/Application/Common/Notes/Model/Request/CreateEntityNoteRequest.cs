using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.Common;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Common.Notes.Model.Request;

public class CreateEntityNoteRequest
{
    [Required]
    public required EntityNoteType EntityNoteType { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string NoteText { get; set; }
}
