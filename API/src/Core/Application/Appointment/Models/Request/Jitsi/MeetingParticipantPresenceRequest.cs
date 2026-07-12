using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.Appointment;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Appointment.Models.Request.Jitsi;
public class MeetingParticipantPresenceRequest
{
    [Required]
    public required string MeetingUrlIdentifier { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [EnumDataType(typeof(MeetingParticipantPresenceStatus), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required MeetingParticipantPresenceStatus Status { get; set; }
}
