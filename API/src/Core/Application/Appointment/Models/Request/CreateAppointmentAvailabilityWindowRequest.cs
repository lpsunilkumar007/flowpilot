using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Appointment.Models.Request;
public class CreateAppointmentAvailabilityWindowRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset OnDate { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset TimeFrom { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset TimeTo { get; set; }
}