using System.ComponentModel.DataAnnotations;
using FlowPilot.Application.Common.Models;
using FlowPilot.Domain.Enums.Appointment;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Appointment.Models.Request;
public class SearchAppointmentsRequest : SearchRequestBaseClass
{
    [EnumDataType(typeof(AppointmentStatus), ErrorMessage = ValidationMessages.RequiredMessage)]
    public AppointmentStatus? AppointmentStatus { get; set; }

    public string? SearchText { get; set; }

    [EnumDataType(typeof(AppointmentLocationType), ErrorMessage = ValidationMessages.RequiredMessage)]
    public AppointmentLocationType? LocationType { get; set; }

    public string? HostUserId { get; set; }
    public string? GuestUserId { get; set; }
    public required DateTimeOffset StartDate { get; set; }
    public required DateTimeOffset EndDate { get; set; }
}
