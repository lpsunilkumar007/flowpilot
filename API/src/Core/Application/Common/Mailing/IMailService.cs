using FlowPilot.Application.Common.Mailing.Models;
using FlowPilot.Application.Email.Model;
using FlowPilot.Application.Nexus.Identity.Users.Models;
using FlowPilot.Application.Nexus.Identity.Users.Models.Request;

namespace FlowPilot.Application.Common.Mailing;

public interface IMailService : ITransientService
{
    Task<SendEmailResponseDto> SendAsync(MailDto request, CancellationToken ct);

    Task EmailRegistrationVerificationEmailAsync(string userId, string code, CancellationToken cancellationToken);

    Task EmailForgotPasswordAsync(string userId, string code, ForgotPasswordRequest request, CancellationToken cancellationToken);

    Task SendAppointmentCreatedEmail(DefaultIdType id);

    Task SendAppointmentCreatedReminderEmail(DefaultIdType id, bool isLastReminder);

    Task SendSystemCancellationAppointmentScheduleEmail(DefaultIdType id);

    Task SendCancellationAppointmentScheduleEmail(DefaultIdType id);

    Task SendRescheduleAppointmentCreatedEmail(DefaultIdType id);

    Task SendEmailOnAppointmentApproval(DefaultIdType tempAppointmentPKId, DefaultIdType tempAppointmentParticipantPKId);

    Task SendEmailOnAppointmentDecline(DefaultIdType tempAppointmentPKId, DefaultIdType tempAppointmentParticipantPKId);

    Task SendApprovedAppointmentReminder(DefaultIdType tempAppointmentPKId, DefaultIdType tempAppointmentParticipantPKId);

    Task TwoFactorVerificationEmailAsync(string userId, string code, CancellationToken cancellationToken);
}
