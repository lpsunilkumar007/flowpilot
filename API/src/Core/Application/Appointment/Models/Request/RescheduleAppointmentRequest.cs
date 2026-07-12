using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.Appointment;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Appointment.Models.Request;
public class RescheduleAppointmentRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DefaultIdType FKTempAppointmentsPKId { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string Title { get; set; }

    public string? Description { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [RequiredIfLessThanOrEqualZero(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required int DurationMinutes { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [EnumDataType(typeof(AppointmentApprovalRule), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required AppointmentApprovalRule ApprovalRule { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [EnumDataType(typeof(AppointmentLocationType), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required AppointmentLocationType LocationType { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [MinLength(1, ErrorMessage = ValidationMessages.RequiredMessage)]
    public required List<CreateAppointmentParticipantRequest> AppointmentParticipants { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [MinLength(1, ErrorMessage = ValidationMessages.RequiredMessage)]
    public required List<CreateAppointmentAvailabilityWindowRequest> AppointmentAvailabilityWindows { get; set; }
    public int MultipleParticipantPerSlot { get; set; }
}
