using System.ComponentModel.DataAnnotations;
using FlowPilot.Application.Nexus.Identity.Users.Models.Response;
using FlowPilot.Domain.Enums.Appointment;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Appointment.Models.Response.AppointmentParticipant;
public class ViewParticipantAppointmentRequestResponse
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string Title { get; set; }

    public string? Description { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required int DurationMinutes { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [EnumDataType(typeof(AppointmentLocationType), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required AppointmentLocationType LocationType { get; set; }
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [EnumDataType(typeof(AppointmentApprovalRule), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required AppointmentApprovalRule ApprovalRule { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [EnumDataType(typeof(AppointmentStatus), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required AppointmentStatus AppointmentStatus { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required int MultipleParticipantPerSlot { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required ViewParticipantAppointmentParticipantResponse HostDetails { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required ViewParticipantAppointmentParticipantResponse ParticipantDetails { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required List<ViewParticipantAppointmentAvailabilityWindowResponse> AvailabilityWindow { get; set; } = [];

    public required List<ViewParticipantAppointmentAvailabilityBookedWindowResponse> BookedWindow { get; set; } = [];

} 

public class ViewParticipantAppointmentParticipantResponse
{

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public ViewUserDetailsResponse ParticipantDetail { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [EnumDataType(typeof(AppointmentParticipantRole), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required AppointmentParticipantRole AppointmentParticipantRole { get; set; }

    [EnumDataType(typeof(AppointmentParticipantResponseStatus), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required AppointmentParticipantResponseStatus AppointmentParticipantResponseStatus { get; set; }

    public DateTimeOffset? RespondedAt { get; set; }

    public string? Notes { get; set; }

    public required string TimeZone { get; set; }

    public MeetingParticipantPresenceStatus MeetingParticipantPresenceStatus { get; set; }
}

public class ViewParticipantAppointmentAvailabilityWindowResponse
{

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset OnDate { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset TimeFrom { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset TimeTo { get; set; }
}

public class ViewParticipantAppointmentAvailabilityBookedWindowResponse
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset ApproveForDate { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset ApproveTimeFrom { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset ApproveTimeTo { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required int BookedCount { get; set; }
}
