using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Appointment.Models.Request.AppointmentParticipant;
public class ParticipantApprovalRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string UrlIdentifier { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset SelectedDate { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset SelectedTimeFrom { get; set; }
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset SelectedTimeTo { get; set; }
}
