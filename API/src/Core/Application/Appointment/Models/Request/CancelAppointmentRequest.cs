using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Appointment.Models.Request;
public class CancelAppointmentRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DefaultIdType FKTempAppointmentsPKId { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public string? CancellationReason { get; set; }
}
