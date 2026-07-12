namespace FlowPilot.Domain.Enums.Appointment;
public enum AppointmentApprovalRule
{
    /// <summary>
    /// Creates the appointment only when all mandatory participants have approved it.
    /// This is a group-approval workflow.
    /// </summary>
    ConfirmedOnlyWhenApprovedByAllRequiredParticipants = 1,

    /// <summary>
    /// The host approves the appointment. Once approved by the host,
    /// all required participant appointments are created.
    /// </summary>
    HostConfirms = 2,

    /// <summary>
    /// Each participant has their own separate appointment.
    /// When a participant approves, *only their own appointment* is created,
    /// and only one appointment is allowed per slot.
    /// </summary>
    CreateAppointmentForTheParticipantOnceApprovedByThatParticipantOnePerSlot = 3,

    /// <summary>
    /// Each participant has their own separate appointment.
    /// When a participant approves, *only their own appointment* is created,
    /// and multiple appointments are allowed for the same slot.
    /// </summary>
    CreateAppointmentForTheParticipantOnceApprovedByThatParticipantMultiplePerSlot = 4,

}