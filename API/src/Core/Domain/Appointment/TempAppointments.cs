using System.ComponentModel.DataAnnotations.Schema;
using FlowPilot.Domain.Enums.Appointment;

namespace FlowPilot.Domain.Appointment;
public class TempAppointments : AuditableEntity
{
    public required string Title { get; set; }

    public string? Description { get; set; }

    public required int DurationMinutes { get; set; }

    public string? CancellationReason { get; set; }

    public string? FKCancelledByApplicationUserPKId { get; set; }

    [ForeignKey(nameof(TempAppointment))]
    public DefaultIdType? FKTempAppointmentPkId { get; set; }

    public required AppointmentApprovalRule ApprovalRule { get; set; }

    public required AppointmentLocationType LocationType { get; set; }

    public required AppointmentStatus AppointmentStatus { get; set; }

    public required List<TempAppointmentParticipants> TempAppointmentParticipants { get; set; }

    public required List<TempAppointmentAvailabilityWindow> TempAppointmentAvailabilityWindows { get; set; }

    public List<TempAppointmentAvailabilityProposedWindow> TempAppointmentAvailabilityProposedWindows { get; set; } = [];

    public virtual TempAppointments TempAppointment { get; set; }

    public required int MultipleParticipantPerSlot { get; set; }
}
