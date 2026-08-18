namespace FlowPilot.Domain.Enums;
public enum EmailTypes
{
    RegistrationVerificationEmail = 1,
    ForgotPasswordEmail = 2,
    AppointmentCreatedEmail = 3,
    AppointmentCreatedReminderEmail = 4,
    AppointmentCancelledEmailForAttendee = 5,
    AppointmentCancelledEmailForHost = 6,
    AppointmentRescheduledEmail = 7,
    AppointmentConfirmedEmailForHost = 8,
    AppointmentDeclinedEmailForHost = 9,
    AppointmentConfirmedEmailForParticipant = 10,
    AppointmentDeclinedEmailForParticipant = 11,
    ConfirmReminderEmailForHost = 12,
    ConfirmReminderEmailForParticipant = 13,
    TwoFactorVerificationEmail = 14,
    CampaignEmail = 15
}
