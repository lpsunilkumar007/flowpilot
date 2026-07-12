using System.ComponentModel.DataAnnotations;
using FlowPilot.Application.Nexus.Identity.Users.Models.Response;
using FlowPilot.Domain.Enums.Appointment;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Appointment.Models.Response;
public class ViewAppointmentRequestResponse
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DefaultIdType Id { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string Title { get; set; }

    public string? Description { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required int DurationMinutes { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [EnumDataType(typeof(AppointmentApprovalRule), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required AppointmentApprovalRule ApprovalRule { get; set; }
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [EnumDataType(typeof(AppointmentStatus), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required AppointmentStatus AppointmentStatus { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [EnumDataType(typeof(AppointmentLocationType), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required AppointmentLocationType LocationType { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required List<ViewAppointmentParticipantResponse> AppointmentParticipants { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required List<ViewAppointmentAvailabilityWindowResponse> AvailabilityWindow { get; set; }

    public List<ViewAppointmentAvailabilityProposedWindow>? AvailabilityProposedWindow { get; set; }
    public string? CancellationReason { get; set; }
    public string? CancelledBy { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required int MultipleParticipantPerSlot { get; set; }
}

public class ViewAppointmentParticipantResponse
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DefaultIdType Id { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [EnumDataType(typeof(ViewUserDetailsResponse), ErrorMessage = ValidationMessages.RequiredMessage)]
    public  ViewUserDetailsResponse ParticipantDetail { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [EnumDataType(typeof(AppointmentParticipantRole), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required AppointmentParticipantRole AppointmentParticipantRole { get; set; }
    [EnumDataType(typeof(AppointmentParticipantResponseStatus), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required AppointmentParticipantResponseStatus AppointmentParticipantResponseStatus { get; set; }

    public DateTimeOffset? RespondedAt { get; set; }

    public string? Notes { get; set; }
    public string? DeclinedReason { get; set; }
    public DateTimeOffset? DeclinedAt { get; set; }
    public DateTimeOffset? ApproveForDate { get; set; }

    public DateTimeOffset? ApproveTimeFrom { get; set; }
    public DateTimeOffset? ApproveTimeTo { get; set; }

    public required string TimeZone { get; set; }
}

public class ViewAppointmentAvailabilityWindowResponse
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DefaultIdType Id { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset OnDate { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset TimeFrom { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset TimeTo { get; set; }
}

public class ViewAppointmentAvailabilityProposedWindow
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DefaultIdType Id { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset OnDate { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset TimeFrom { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset TimeTo { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [EnumDataType(typeof(ViewUserDetailsResponse), ErrorMessage = ValidationMessages.RequiredMessage)]
    public ViewUserDetailsResponse ProposedParticipantDetail { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required AppointmentAvailabilityProposedWindowStatus AppointmentAvailabilityProposedWindowStatus { get; set; }
}