using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.Appointment;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Appointment.Models.Request;
public class CreateAppointmentParticipantRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string FKApplicationUserPKId { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [EnumDataType(typeof(AppointmentParticipantRole), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required AppointmentParticipantRole AppointmentParticipantRole { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string TimeZone { get; set; }
}
