using System.ComponentModel.DataAnnotations;
using FlowPilot.Application.ExternalIntegrations.Jitsi.Models.Response;
using FlowPilot.Domain.Enums.Appointment;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Appointment.Models.Response.AppointmentParticipant;
public class StartMeetingResponse
{
    [Required]
    public required string Title { get; set; }

    public string? Description { get; set; }

    [Required]
    public required int DurationMinutes { get; set; }

    [Required]
    [EnumDataType(typeof(AppointmentLocationType), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required AppointmentLocationType LocationType { get; set; }

    [Required]
    [EnumDataType(typeof(AppointmentStatus), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required AppointmentStatus AppointmentStatus { get; set; }

    [Required]
    public required ViewParticipantAppointmentParticipantResponse HostDetails { get; set; }

    [Required]
    public required ViewParticipantAppointmentParticipantResponse CurrentParticipantDetail { get; set; }

    [Required]
    public required List<ViewParticipantAppointmentParticipantResponse> ParticipantDetails { get; set; }

    public JitsiRoomSettingResponse? JitsiRoomSettingResponse { get; set; }

}
