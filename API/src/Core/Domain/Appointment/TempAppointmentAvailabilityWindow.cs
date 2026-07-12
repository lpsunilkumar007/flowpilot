using System.ComponentModel.DataAnnotations.Schema;

namespace FlowPilot.Domain.Appointment;
public class TempAppointmentAvailabilityWindow : AuditableEntity
{
    [ForeignKey(nameof(TempAppointment))]
    public required DefaultIdType FKTempAppointmentsPKId { get; set; }

    public required DateTimeOffset OnDate { get; set; }

    public required DateTimeOffset TimeFrom { get; set; }

    public required DateTimeOffset TimeTo { get; set; }

    public virtual TempAppointments TempAppointment { get; set; }
}
