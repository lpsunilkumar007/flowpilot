using System.ComponentModel.DataAnnotations.Schema;
using FlowPilot.Domain.Enums.Appointment;

namespace FlowPilot.Domain.Appointment;
public class TempAppointmentAvailabilityProposedWindow : AuditableEntity
{
    [ForeignKey(nameof(TempAppointment))]
    public required DefaultIdType FKTempAppointmentsPKId { get; set; }

    public required DateTimeOffset OnDate { get; set; }

    public required DateTimeOffset TimeFrom { get; set; }

    public required DateTimeOffset TimeTo { get; set; }

    [ForeignKey(nameof(TempAppointmentParticipant))]
    public required DefaultIdType FKTempAppointmentParticipantsPkId { get; set; }

    public virtual TempAppointmentParticipants TempAppointmentParticipant { get; set; }

    public required AppointmentAvailabilityProposedWindowStatus AppointmentAvailabilityProposedWindowStatus { get; set; }

    public TempAppointments TempAppointment { get; set; }
}
