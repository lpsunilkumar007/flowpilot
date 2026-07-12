using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FlowPilot.Application.Nexus.Identity.Users.Models.Response;
using FlowPilot.Domain.Enums.Appointment;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Appointment.Models.Response;
public class ViewAppointmentForParticipantRequestResponse
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
    public required List<ViewAppointmentForParticipantParticipantResponse> AppointmentParticipants { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required List<ViewAppointmentForParticipantAvailabilityWindowResponse> AvailabilityWindow { get; set; }

    public List<ViewAppointmentForParticipantAvailabilityProposedWindow>? AvailabilityProposedWindow { get; set; }
}

public class ViewAppointmentForParticipantParticipantResponse
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required ViewUserDetailsResponse ParticipantDetail { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [EnumDataType(typeof(AppointmentParticipantRole), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required AppointmentParticipantRole AppointmentParticipantRole { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [EnumDataType(typeof(AppointmentParticipantResponseStatus), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required AppointmentParticipantResponseStatus AppointmentParticipantResponseStatus { get; set; }

    public DateTimeOffset? RespondedAt { get; set; }

    public string? Notes { get; set; }

    public required string TimeZone { get; set; }
}

public class ViewAppointmentForParticipantAvailabilityWindowResponse
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset OnDate { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset TimeFrom { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset TimeTo { get; set; }
}

public class ViewAppointmentForParticipantAvailabilityProposedWindow
{

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset OnDate { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset TimeFrom { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset TimeTo { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required ViewUserDetailsResponse ProposedParticipantDetail { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [EnumDataType(typeof(AppointmentAvailabilityProposedWindowStatus), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required AppointmentAvailabilityProposedWindowStatus AppointmentAvailabilityProposedWindowStatus { get; set; }
}
