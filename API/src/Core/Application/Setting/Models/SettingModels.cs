using FlowPilot.Application.Common.Mailing.Models;
using FlowPilot.Domain.Enums.Appointment;

namespace FlowPilot.Application.Setting.Models;

public class AppointmentSettingModels
{
    public MailDto AppointmentCreatedEmail { get; set; } = new MailDto
    {
        EmailType = EmailTypes.AppointmentCreatedEmail,
        To = [],
        From = string.Empty,
        DisplayName = string.Empty,
        Subject = "New Appointment Scheduled – {APPOINTMENT.TITLE}",
        Body = @"Hi {{PARTICIPANT.FULLNAME}},

        You’ve been invited to an appointment. Please review the details below and confirm your availability.

        -------------------------------
        Title:        {{APPOINTMENT.TITLE}}
        Duration:     {{APPOINTMENT.DURATION}}
        Location:     {{APPOINTMENT.LOCATIONTYPE}}
        Host:         {{HOST.FULLNAME}}
        -------------------------------

        Proposed Time Slots: 
        {{PROPOSEDTIMESLOTS}}

        To confirm your availability and choose your preferred slot, please click the link below:
        ?? Confirm Appointment: {{CONFIRMURL}}

        If none of these options work for you, you can decline or propose new times on the confirmation page.

        Thank you,
        {{HOST.FULLNAME}}

        -------------------------------
        This is an automated message from the Appointment Scheduler.
        Please do not reply directly to this email.",
    };

    public MailDto AppointmentCreatedReminderEmail { get; set; } = new MailDto
    {
        EmailType = EmailTypes.AppointmentCreatedReminderEmail,
        To = [],
        From = string.Empty,
        DisplayName = string.Empty,
        Subject = "Reminder: Upcoming Appointment – {APPOINTMENT.TITLE}",
        Body = @"Hi {{PARTICIPANT.FULLNAME}},

This is a friendly reminder about your upcoming appointment.

-------------------------------
Title:        {{APPOINTMENT.TITLE}}
Date & Time:  {{APPOINTMENT.DATE}}
Duration:     {{APPOINTMENT.DURATION}}
Location:     {{APPOINTMENT.LOCATIONTYPE}}
Host:         {{HOST.FULLNAME}}
-------------------------------

If you need to reschedule or cancel, please use the link below:
?? Manage Appointment: {{CONFIRMURL}}

We look forward to meeting with you!

Thank you,
{{HOST.FULLNAME}}

-------------------------------
This is an automated reminder from the Appointment Scheduler.
Please do not reply directly to this email.",
    };

    public MailDto AppointmentSystemCancelledEmailForAttendee { get; set; } = new MailDto
    {
        EmailType = EmailTypes.AppointmentCancelledEmailForAttendee,
        To = [],
        From = string.Empty,
        DisplayName = string.Empty,
        Subject = "Appointment Cancelled – {APPOINTMENT.TITLE}",
        Body = @"Hi {{PARTICIPANT.FULLNAME}},

We wanted to let you know that the appointment titled {{APPOINTMENT.TITLE}} has been cancelled.

-------------------------------
Title:        {{APPOINTMENT.TITLE}}
Duration:     {{APPOINTMENT.DURATION}}
Location:     {{APPOINTMENT.LOCATIONTYPE}}
Host:         {{HOST.FULLNAME}}
Status:       Cancelled
-------------------------------

Thank you for your understanding.

-------------------------------
This is an automated message from the Appointment Scheduler.  
Please do not reply directly to this email."
    };

    public MailDto AppointmentSystemCancelledEmailForHost { get; set; } = new MailDto
    {
        EmailType = EmailTypes.AppointmentCancelledEmailForHost,
        To = [],
        From = string.Empty,
        DisplayName = string.Empty,
        Subject = "Appointment Cancelled – {APPOINTMENT.TITLE}",
        Body = @"Hi {{HOST.FULLNAME}},

We wanted to let you know that the appointment titled {{APPOINTMENT.TITLE}} has been cancelled.

-------------------------------
Title:        {{APPOINTMENT.TITLE}}
Duration:     {{APPOINTMENT.DURATION}}
Location:     {{APPOINTMENT.LOCATIONTYPE}}
Participants: {PARTICIPANTS.SUMMARY}
Status:       Cancelled
-------------------------------

Thank you for your understanding.

-------------------------------
This is an automated message from the Appointment Scheduler.  
Please do not reply directly to this email."
    };

    public List<int> ReminderAfterDays { get; set; } = [];

    public bool IncludeFinalReminderBeforeAppointment { get; set; } = false;

    public bool IsAutoAppointmentCancelEnabled { get; set; } = false;

    public MailDto AppointmentCancelledEmailForAttendee { get; set; } = new MailDto
    {
        EmailType = EmailTypes.AppointmentCancelledEmailForAttendee,
        To = [],
        From = string.Empty,
        DisplayName = string.Empty,
        Subject = "Appointment Cancelled – {APPOINTMENT.TITLE}",
        Body = @"Hi {{PARTICIPANT.FULLNAME}},

            We wanted to let you know that the appointment titled {{APPOINTMENT.TITLE}} has been cancelled.

            -------------------------------
            Title:        {{APPOINTMENT.TITLE}}
            Duration:     {{APPOINTMENT.DURATION}}
            Location:     {{APPOINTMENT.LOCATIONTYPE}}
            Host:         {{HOST.FULLNAME}}
            Status:       Cancelled
            -------------------------------

            {{APPOINTMENT.CANCELLATIONREASON}}

            Thank you for your understanding.


            -------------------------------
            This is an automated message from the Appointment Scheduler.  
            Please do not reply directly to this email."
    };

    public MailDto AppointmentCancelledEmailForHost { get; set; } = new MailDto
    {
        EmailType = EmailTypes.AppointmentCancelledEmailForHost,
        To = [],
        From = string.Empty,
        DisplayName = string.Empty,
        Subject = "Appointment Cancelled – {APPOINTMENT.TITLE}",
        Body = @"Hi {{HOST.FULLNAME}},

The appointment you scheduled has been successfully cancelled.

-------------------------------
Title:        {{APPOINTMENT.TITLE}}
Duration:     {{APPOINTMENT.DURATION}}
Location:     {{APPOINTMENT.LOCATIONTYPE}}
Participants: {PARTICIPANTS.SUMMARY}
Status:       Cancelled
-------------------------------


{{APPOINTMENT.CANCELLATIONREASON}}

Thank you for your understanding.


-------------------------------
This is an automated message from the Appointment Scheduler.  
Please do not reply directly to this email."
    };

    public MailDto AppointmentRescheduledEmail { get; set; } = new MailDto
    {
        EmailType = EmailTypes.AppointmentRescheduledEmail,
        To = [],
        From = string.Empty,
        DisplayName = string.Empty,
        Subject = "Appointment Rescheduled – {APPOINTMENT.TITLE}",
        Body = @"Hi {{PARTICIPANT.FULLNAME}},
                Your appointment has been rescheduled. Please review the updated details below and confirm your availability.

                -------------------------------
                Title:         {{APPOINTMENT.TITLE}}
                New Date/Time: {{APPOINTMENT.RESCHEDULE.ONDATE}}
                New TimeFrom:  {{APPOINTMENT.RESCHEDULE.TIMEFROM}}
                New TimeTo:    {{APPOINTMENT.RESCHEDULE.TIMETO}}
                Duration:      {{APPOINTMENT.DURATION}}
                Location:      {{APPOINTMENT.LOCATIONTYPE}}
                Host:          {{HOST.FULLNAME}}
                Participants:  {{PARTICIPANT.FULLNAME}}
                -------------------------------

                Updated Time Options:
                {{PROPOSEDTIMESLOTS}}

                To confirm your new appointment time, please click the link below:
                ?? Confirm Rescheduled Appointment: {{CONFIRMURL}}

                If the updated time doesn’t work for you, you can decline or propose an alternative on the confirmation page.

                Thank you for your understanding,
                {{HOST.FULLNAME}}

                -------------------------------
                This is an automated message from the Appointment Scheduler.
                Please do not reply directly to this email.",
    };

    public List<AppointmentColorSetting> AppointmentColorSetting { get; set; }

    public AppointmentSettingModels(List<AppointmentColorSetting>? existingSettings = null)
    {
        AppointmentColorSetting = DefaultColorSettings(existingSettings);
    }

    private static List<AppointmentColorSetting> DefaultColorSettings(List<AppointmentColorSetting>? existingSettings)
    {
        var defaultSettings = Enum.GetValues(typeof(AppointmentStatus))
            .Cast<AppointmentStatus>()
            .Select(status => new AppointmentColorSetting
            {
                AppointmentStatus = status,
                BackgroundColor = GetDefaultColor(status)
            })
            .ToList();

        if (existingSettings == null || !existingSettings.Any())
            return defaultSettings;

        foreach (var existing in existingSettings)
        {
            var match = defaultSettings.FirstOrDefault(x => x.AppointmentStatus == existing.AppointmentStatus);
            if (match != null)
                match.BackgroundColor = existing.BackgroundColor;
        }

        return defaultSettings;
    }

    private static string GetDefaultColor(AppointmentStatus status)
    {
        return status switch
        {
            //AppointmentStatus.Draft => "#B0BEC5",
            AppointmentStatus.Proposing => "#42A5F5",
            //AppointmentStatus.Negotiating => "#FFB300",
            AppointmentStatus.Scheduled => "#66BB6A",
            AppointmentStatus.Cancelled => "#EF5350",
            //AppointmentStatus.Expired => "#8D6E63",
            AppointmentStatus.SystemCancelled => "#D32F2F",
            AppointmentStatus.Rescheduled => "#7E57C2",
            _ => "#9E9E9E"
        };
    }

}

public class AppointmentColorSetting
{
    public AppointmentStatus AppointmentStatus { get; set; }    
    public required string BackgroundColor { get; set; }
}

public class ApprovedAppointmentSetting
{
    public MailDto AppointmentConfirmedEmailForHost { get; set; } = new MailDto
    {
        EmailType = EmailTypes.AppointmentConfirmedEmailForHost,
        To = [],
        From = string.Empty,
        DisplayName = string.Empty,
        Subject = "Appointment Confirmed – {APPOINTMENT.TITLE}",
        Body = @"Hello {{HOST.FULLNAME}},

            Your appointment has been confirmed successfully.

            -------------------------------
            Title:        {{APPOINTMENT.TITLE}}
            Date:         {{APPOINTMENT.APPROVEFORDATE}}
            TimeFrom:     {{APPOINTMENT.APPROVETIMEFROM}}
            TimeTo:       {{APPOINTMENT.APPROVETIMETO}} 
            Duration:     {{APPOINTMENT.DURATION}}
            Location:     {{APPOINTMENT.LOCATIONTYPE}}
            Participants: {{PARTICIPANT.FULLNAME}}
            Status:       Confirmed
            -------------------------------

            We look forward to your successful meeting.

            -------------------------------
            This is an automated message from the Appointment Scheduler.  
            Please do not reply directly to this email."
    };

    public MailDto AppointmentDeclinedEmailForHost { get; set; } = new MailDto
    {
        EmailType = EmailTypes.AppointmentDeclinedEmailForHost,
        To = [],
        From = string.Empty,
        DisplayName = string.Empty,
        Subject = "Appointment Declined – {APPOINTMENT.TITLE}",
        Body = @"Hello {{HOST.FULLNAME}},

            The appointment you scheduled has been declined by the participant.

            -------------------------------
            Title:          {{APPOINTMENT.TITLE}}
            Date:           {{APPOINTMENT.DATE}}
            Time:           {{APPOINTMENT.TIME}}
            Duration:       {{APPOINTMENT.DURATION}}
            Location:       {{APPOINTMENT.LOCATIONTYPE}}
            Participant:    {{PARTICIPANT.FULLNAME}}
            DeclinedReason: {{APPOINTMENT.DECLINEDREASON}}
            DeclinedAt:     {{APPOINTMENT.DECLINEDAT}}
            Status:       Declined
            -------------------------------
            {{APPOINTMENT.CANCELLATIONREASON}}

            You may reschedule or reach out to the participant for further details.

            -------------------------------
            This is an automated message from the Appointment Scheduler.  
            Please do not reply directly to this email."
    };

    public MailDto AppointmentConfirmedEmailForParticipant { get; set; } = new MailDto
    {
        EmailType = EmailTypes.AppointmentConfirmedEmailForParticipant,
        To = [],
        From = string.Empty,
        DisplayName = string.Empty,
        Subject = "Appointment Confirmed – {APPOINTMENT.TITLE}",
        Body = @"Hello {{PARTICIPANT.FULLNAME}},

            Your appointment with {{HOST.FULLNAME}} has been confirmed.

            -------------------------------
            Title:        {{APPOINTMENT.TITLE}}
            Date:         {{APPOINTMENT.APPROVEFORDATE}}
            TimeFrom:     {{APPOINTMENT.APPROVETIMEFROM}}
            TimeTo:       {{APPOINTMENT.APPROVETIMETO}} 
            Duration:     {{APPOINTMENT.DURATION}}
            Location:     {{APPOINTMENT.LOCATIONTYPE}}
            Host:         {{HOST.FULLNAME}}
            Status:       Confirmed
            -------------------------------

            Please make sure to be available at the scheduled time.

            -------------------------------
            This is an automated message from the Appointment Scheduler.  
            Please do not reply directly to this email."
    };

    public MailDto AppointmentDeclinedEmailForParticipant { get; set; } = new MailDto
    {
        EmailType = EmailTypes.AppointmentDeclinedEmailForParticipant,
        To = [],
        From = string.Empty,
        DisplayName = string.Empty,
        Subject = "Appointment Declined – {APPOINTMENT.TITLE}",
        Body = @"Hello {{PARTICIPANT.FULLNAME}},

            Your appointment request with {{HOST.FULLNAME}} has been declined.

            -------------------------------
            Title:        {{APPOINTMENT.TITLE}}
            Date:         {{APPOINTMENT.DATE}}
            Time:         {{APPOINTMENT.TIME}}
            Location:     {{APPOINTMENT.LOCATIONTYPE}}
            Host:         {{HOST.FULLNAME}}
            Status:       Declined
            -------------------------------
            {{APPOINTMENT.CANCELLATIONREASON}}

            You may request a new appointment at a different time if needed.

            -------------------------------
            This is an automated message from the Appointment Scheduler.  
            Please do not reply directly to this email."
    };

    public int ReminderBeforeDays { get; set; } = 2;
    public int LastReminderBeforeMinute { get; set; } = 60;

    public MailDto ConfirmedReminderEmailForHost { get; set; } = new MailDto
    {
        EmailType = EmailTypes.ConfirmReminderEmailForHost,
        To = [],
        From = string.Empty,
        DisplayName = string.Empty,
        Subject = "Reminder: Confirmed Appointment – {APPOINTMENT.TITLE}",
        Body = @"Hello {{HOST.FULLNAME}},  

                This is a reminder for your upcoming confirmed appointment.

                -------------------------------
                Title:        {{APPOINTMENT.TITLE}}
                Date:         {{APPOINTMENT.APPROVEFORDATE}}
                TimeFrom:     {{APPOINTMENT.APPROVETIMEFROM}}
                TimeTo:       {{APPOINTMENT.APPROVETIMETO}}
                Duration:     {{APPOINTMENT.DURATION}}
                Location:     {{APPOINTMENT.LOCATIONTYPE}}
                Participants: {{PARTICIPANT.FULLNAME}}
                Status:       Confirmed
                -------------------------------

                Please make sure you are prepared ahead of time.  
                We wish you a productive and successful meeting.

                Thank you,  
                Appointment Scheduler

                -------------------------------
                This is an automated reminder from the Appointment Scheduler.  
                Please do not reply directly to this email.",
    };

    public MailDto ConfirmedReminderEmailForParticipants { get; set; } = new MailDto
    {
        EmailType = EmailTypes.ConfirmReminderEmailForParticipant,
        To = [],
        From = string.Empty,
        DisplayName = string.Empty,
        Subject = "Reminder: Confirmed Appointment – {APPOINTMENT.TITLE}",
        Body = @"Hi {{PARTICIPANT.FULLNAME}},  

                This is a reminder for your upcoming confirmed appointment with {{HOST.FULLNAME}}.

                -------------------------------
                Title:        {{APPOINTMENT.TITLE}}
                Date:         {{APPOINTMENT.APPROVEFORDATE}}
                TimeFrom:     {{APPOINTMENT.APPROVETIMEFROM}}
                TimeTo:       {{APPOINTMENT.APPROVETIMETO}}
                Duration:     {{APPOINTMENT.DURATION}}
                Location:     {{APPOINTMENT.LOCATIONTYPE}}
                Host:         {{HOST.FULLNAME}}
                Status:       Confirmed
                -------------------------------

                Please ensure you are prepared ahead of time.  
                We look forward to your participation.

                Thank you,  
                Appointment Scheduler

                -------------------------------
                This is an automated reminder from the Appointment Scheduler.  
                Please do not reply directly to this email.",
    };

    public MailDto JitsiConfirmedReminderEmailForHost { get; set; } = new MailDto
    {
        EmailType = EmailTypes.ConfirmReminderEmailForHost,
        To = [],
        From = string.Empty,
        DisplayName = string.Empty,
        Subject = "Reminder: Confirmed Appointment – {APPOINTMENT.TITLE}",
        Body = @"Hello {{HOST.FULLNAME}},  

                This is a reminder for your upcoming confirmed appointment.

                -------------------------------
                Title:        {{APPOINTMENT.TITLE}}
                Date:         {{APPOINTMENT.APPROVEFORDATE}}
                TimeFrom:     {{APPOINTMENT.APPROVETIMEFROM}}
                TimeTo:       {{APPOINTMENT.APPROVETIMETO}}
                Duration:     {{APPOINTMENT.DURATION}}
                Location:     {{APPOINTMENT.LOCATIONTYPE}}
                Participants: {{PARTICIPANT.FULLNAME}}
                Meeting Link: {{APPOINTMENT.MEETINGLINK}}
                Status:       Confirmed
                -------------------------------

                Please make sure you are prepared ahead of time.  
                We wish you a productive and successful meeting.

                Thank you,  
                Appointment Scheduler

                -------------------------------
                This is an automated reminder from the Appointment Scheduler.  
                Please do not reply directly to this email.",
    };

    public MailDto JitsiConfirmedReminderEmailForParticipants { get; set; } = new MailDto
    {
        EmailType = EmailTypes.ConfirmReminderEmailForParticipant,
        To = [],
        From = string.Empty,
        DisplayName = string.Empty,
        Subject = "Reminder: Confirmed Appointment – {APPOINTMENT.TITLE}",
        Body = @"Hi {{PARTICIPANT.FULLNAME}},  

                This is a reminder for your upcoming confirmed appointment with {{HOST.FULLNAME}}.

                -------------------------------
                Title:        {{APPOINTMENT.TITLE}}
                Date:         {{APPOINTMENT.APPROVEFORDATE}}
                TimeFrom:     {{APPOINTMENT.APPROVETIMEFROM}}
                TimeTo:       {{APPOINTMENT.APPROVETIMETO}}
                Duration:     {{APPOINTMENT.DURATION}}
                Location:     {{APPOINTMENT.LOCATIONTYPE}}
                Host:         {{HOST.FULLNAME}}
                Meeting Link: {{APPOINTMENT.MEETINGLINK}}
                Status:       Confirmed
                -------------------------------

                Please ensure you are prepared ahead of time.  
                We look forward to your participation.

                Thank you,  
                Appointment Scheduler

                -------------------------------
                This is an automated reminder from the Appointment Scheduler.  
                Please do not reply directly to this email.",
    };
}
