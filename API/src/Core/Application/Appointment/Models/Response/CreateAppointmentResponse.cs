using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.Appointment.Models.Response;
public class CreateAppointmentResponse
{
    [Required]
    public required string Message { get; set; }

    [Required]
    public DefaultIdType Id { get; set; }
}
