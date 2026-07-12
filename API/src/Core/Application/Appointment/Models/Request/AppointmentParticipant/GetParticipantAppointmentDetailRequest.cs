using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Appointment.Models.Request.AppointmentParticipant;
public class GetParticipantAppointmentDetailRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string UrlIdentifier { get; set; }
}
