using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.Appointment;

namespace FlowPilot.Application.Appointment.Models.Response;
public class ViewAppointments
{
    [Required]
    public required DefaultIdType Id { get; set; }

    [Required]
    public required string Title { get; set; }

    public string? Description { get; set; }

    [Required]
    public required int DurationMinutes { get; set; }

    [Required]
    public required AppointmentLocationType LocationType { get; set; }

    [Required]
    public required AppointmentStatus AppointmentStatus { get; set; }

    [Required]
    public List<ViewAppointmentParticipantResponse> AppointmentParticipants { get; set; } = [];

    [Required]
    public List<ViewAppointmentAvailabilityWindowResponse> AvailabilityWindow { get; set; } = [];

    public List<ViewAppointmentAvailabilityProposedWindow>? AvailabilityProposedWindow { get; set; }

    public string? CancellationReason { get; set; }
    public string? CancelledBy { get; set; }

}