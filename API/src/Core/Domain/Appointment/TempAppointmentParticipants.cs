using System.ComponentModel.DataAnnotations.Schema;
using FlowPilot.Domain.Enums.Appointment;

namespace FlowPilot.Domain.Appointment;
public class TempAppointmentParticipants : AuditableEntity
{
    [ForeignKey(nameof(TempAppointment))]
    public required DefaultIdType FKTempAppointmentsPKId { get; set; }

    public virtual TempAppointments TempAppointment { get; set; }

    public required string FKApplicationUserPKId { get; set; }

    public required AppointmentParticipantRole AppointmentParticipantRole { get; set; }

    public required AppointmentParticipantResponseStatus AppointmentParticipantResponseStatus { get; set; }

    public DateTimeOffset? ApprovedAt { get; set; }

    public string? DeclinedReason { get; set; }

    public DateTimeOffset? DeclinedAt { get; set; }

    public required string UrlIdentifier { get; set; }

    public DateTimeOffset? ApproveForDate { get; set; }

    public DateTimeOffset? ApproveTimeFrom { get; set; }

    public DateTimeOffset? ApproveTimeTo { get; set; }

    public required string TimeZone { get; set; }

    public required string MeetingUrlIdentifier { get; set; }

    public required MeetingParticipantPresenceStatus MeetingParticipantPresenceStatus { get; set; }
}
