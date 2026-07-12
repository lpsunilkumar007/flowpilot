using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Appointment.Models.Request.AppointmentParticipant;
public class ParticipantCancelRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string UrlIdentifier { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string Reason { get; set; }
}
