using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Appointment.Models.Response.AppointmentParticipant;
public class ParticipantApprovalResponse
{
    [Required]
    public required DateTimeOffset SelectedDate { get; set; }

    [Required]
    public required DateTimeOffset SelectedTimeFrom { get; set; }

    [Required]
    public required DateTimeOffset SelectedTimeTo { get; set; }
}
