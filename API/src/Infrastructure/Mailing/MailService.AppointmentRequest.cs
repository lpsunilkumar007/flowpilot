using System.Text;
using FlowPilot.Application.Common.Extensions;
using FlowPilot.Application.Common.Mailing.Models;
using FlowPilot.Application.Setting.Models;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Mailing;
public partial class MailService
{
    public async Task SendAppointmentCreatedEmail(DefaultIdType id)
    {
        var appointmentDetail = await _applicationDbContext.TempAppointments.Include(x => x.TempAppointmentParticipants)
            .Include(x => x.TempAppointmentAvailabilityWindows).SingleOrDefaultAsync(x => x.Id == id);

        if (appointmentDetail == null || appointmentDetail.ApprovalRule == Domain.Enums.Appointment.AppointmentApprovalRule.HostConfirms
            )
        {
            return;
        }

        var appointmentCreatedEmail = await _settingService.GetSettingByCodeAsync(Domain.Enums.SettingTypes.Appointment);

        var appointmentParticipants = appointmentDetail.TempAppointmentParticipants.Where(x => x.AppointmentParticipantRole != Domain.Enums.Appointment.AppointmentParticipantRole.Host);

        var userDetails = await GetUserDetails(appointmentParticipants.Select(x => x.FKApplicationUserPKId).ToArray());
        var hostDetails = (await GetUserDetails(appointmentDetail.TempAppointmentParticipants.Where(x => x.AppointmentParticipantRole == Domain.Enums.Appointment.AppointmentParticipantRole.Host).Select(x => x.FKApplicationUserPKId).ToArray()))[0];

        foreach (var user in userDetails)
        {
            MailDto mailRequest = _serializerService.Deserialize<AppointmentSettingModels>(appointmentCreatedEmail.SettingValues).AppointmentCreatedEmail;

            var sb = new StringBuilder();
            foreach (var slot in appointmentDetail.TempAppointmentAvailabilityWindows)
            {
                sb.AppendLine($"• {slot.OnDate:dddd, dd MMM yyyy} – {slot.TimeFrom:hh:mm tt} to {slot.TimeTo:hh:mm tt}");
            }

            string fullName(string first, string last) => string.Join(' ', new[] { first, last }.Where(s => !string.IsNullOrWhiteSpace(s)));

            var tempAppointmentParticipant = appointmentParticipants.First(x => x.FKApplicationUserPKId == user.Id.ToString());

            string uri = string.Format(_frontUserPortalSettings.Urls.AppointmentConfirmationUrl, tempAppointmentParticipant.UrlIdentifier);

            var placeholderMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["{{CONFIRMURL}}"] = uri,
                ["{{PROPOSEDTIMESLOTS}}"] = sb.ToString().TrimEnd(),
                ["{{PARTICIPANT.FIRSTNAME}}"] = user.FirstName ?? string.Empty,
                ["{{PARTICIPANT.LASTNAME}}"] = user.LastName ?? string.Empty,
                ["{{PARTICIPANT.FULLNAME}}"] = fullName(user.FirstName ?? string.Empty, user.LastName ?? string.Empty),
                ["{{HOST.FIRSTNAME}}"] = hostDetails.FirstName ?? string.Empty,
                ["{{HOST.LASTNAME}}"] = hostDetails.LastName ?? string.Empty,
                ["{{HOST.FULLNAME}}"] = fullName(hostDetails.FirstName ?? string.Empty, hostDetails.LastName ?? string.Empty),
                ["{{APPOINTMENT.TITLE}}"] = appointmentDetail.Title,
                ["{{APPOINTMENT.DURATION}}"] = appointmentDetail.DurationMinutes.ToString(),
                ["{{APPOINTMENT.LOCATIONTYPE}}"] = appointmentDetail.LocationType.GetDescription(),
            };

            mailRequest.Subject = ReplaceAll(mailRequest.Subject, placeholderMap);
            mailRequest.Body = ReplaceAll(mailRequest.Body, placeholderMap);

            mailRequest.To = [user.Email!];
            await SendAsync(mailRequest, new CancellationToken());
        }

    }

    public async Task SendAppointmentCreatedReminderEmail(DefaultIdType id, bool isLastReminder)
    {
        var appointmentDetail = await _applicationDbContext.TempAppointments.Include(x => x.TempAppointmentParticipants)
            .Include(x => x.TempAppointmentAvailabilityWindows).SingleOrDefaultAsync(x => x.Id == id);

        if (appointmentDetail == null || appointmentDetail.ApprovalRule == Domain.Enums.Appointment.AppointmentApprovalRule.HostConfirms
            || appointmentDetail.AppointmentStatus != Domain.Enums.Appointment.AppointmentStatus.Proposing
            )
        {
            return;
        }

        var settings = await _settingService.GetSettingByCodeAsync(Domain.Enums.SettingTypes.Appointment);

        var appointmentParticipants = appointmentDetail.TempAppointmentParticipants.Where(x => x.AppointmentParticipantRole
        != Domain.Enums.Appointment.AppointmentParticipantRole.Host && x.AppointmentParticipantResponseStatus == Domain.Enums.Appointment.AppointmentParticipantResponseStatus.Pending);

        if (appointmentParticipants.Count() == 0)
        {
            return;
        }

        var userDetails = await GetUserDetails(appointmentParticipants.Select(x => x.FKApplicationUserPKId).ToArray());
        var hostDetails = (await GetUserDetails(appointmentDetail.TempAppointmentParticipants.Where(x => x.AppointmentParticipantRole == Domain.Enums.Appointment.AppointmentParticipantRole.Host).Select(x => x.FKApplicationUserPKId).ToArray()))[0];

        foreach (var user in userDetails)
        {
            MailDto mailRequest = _serializerService.Deserialize<AppointmentSettingModels>(settings.SettingValues).AppointmentCreatedReminderEmail;

            var sb = new StringBuilder();
            foreach (var slot in appointmentDetail.TempAppointmentAvailabilityWindows)
            {
                sb.AppendLine($"• {slot.OnDate:dddd, dd MMM yyyy} – {slot.TimeFrom:hh:mm tt} to {slot.TimeTo:hh:mm tt}");
            }

            string fullName(string first, string last) => string.Join(' ', new[] { first, last }.Where(s => !string.IsNullOrWhiteSpace(s)));

            var tempAppointmentParticipant = appointmentParticipants.Single(x => x.FKApplicationUserPKId == user.Id.ToString());

            string uri = string.Format(_frontUserPortalSettings.Urls.AppointmentConfirmationUrl, tempAppointmentParticipant.UrlIdentifier);

            var placeholderMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["{{CONFIRMURL}}"] = uri,
                ["{{PROPOSEDTIMESLOTS}}"] = sb.ToString().TrimEnd(),
                ["{{PARTICIPANT.FIRSTNAME}}"] = user.FirstName ?? string.Empty,
                ["{{PARTICIPANT.LASTNAME}}"] = user.LastName ?? string.Empty,
                ["{{PARTICIPANT.FULLNAME}}"] = fullName(user.FirstName ?? string.Empty, user.LastName ?? string.Empty),
                ["{{HOST.FIRSTNAME}}"] = hostDetails.FirstName ?? string.Empty,
                ["{{HOST.LASTNAME}}"] = hostDetails.LastName ?? string.Empty,
                ["{{HOST.FULLNAME}}"] = fullName(hostDetails.FirstName ?? string.Empty, hostDetails.LastName ?? string.Empty),
                ["{{APPOINTMENT.TITLE}}"] = appointmentDetail.Title,
                ["{{APPOINTMENT.DURATION}}"] = appointmentDetail.DurationMinutes.ToString(),
                ["{{APPOINTMENT.LOCATIONTYPE}}"] = appointmentDetail.LocationType.GetDescription(),
            };

            mailRequest.Subject = ReplaceAll(mailRequest.Subject, placeholderMap);
            mailRequest.Body = ReplaceAll(mailRequest.Body, placeholderMap);

            mailRequest.To = [user.Email!];
            await SendAsync(mailRequest, new CancellationToken());
        }

    }

    public async Task SendSystemCancellationAppointmentScheduleEmail(DefaultIdType id)
    {
        var appointmentDetail = await _applicationDbContext.TempAppointments.Include(x => x.TempAppointmentParticipants)
            .Include(x => x.TempAppointmentAvailabilityWindows).SingleOrDefaultAsync(x => x.Id == id);

        if (appointmentDetail == null || appointmentDetail.AppointmentStatus != Domain.Enums.Appointment.AppointmentStatus.SystemCancelled
            )
        {
            return;
        }

        var settings = await _settingService.GetSettingByCodeAsync(Domain.Enums.SettingTypes.Appointment);
        var settingsDeserialized = _serializerService.Deserialize<AppointmentSettingModels>(settings.SettingValues);
        if (settingsDeserialized.IsAutoAppointmentCancelEnabled == false)
        {
            return;
        }

        var userDetails = await GetUserDetails(appointmentDetail.TempAppointmentParticipants.Select(x => x.FKApplicationUserPKId).ToArray());
        var hostDetails = (await GetUserDetails(appointmentDetail.TempAppointmentParticipants.Where(x => x.AppointmentParticipantRole == Domain.Enums.Appointment.AppointmentParticipantRole.Host).Select(x => x.FKApplicationUserPKId).ToArray()))[0];

        foreach (var user in userDetails)
        {
            MailDto mailRequest;
            if (appointmentDetail.TempAppointmentParticipants.Any(x => x.FKApplicationUserPKId == user.Id.ToString() && x.AppointmentParticipantRole == Domain.Enums.Appointment.AppointmentParticipantRole.Host))
            {
                mailRequest = _serializerService.Deserialize<AppointmentSettingModels>(settings.SettingValues).AppointmentSystemCancelledEmailForHost;
            }
            else
            {
                mailRequest = _serializerService.Deserialize<AppointmentSettingModels>(settings.SettingValues).AppointmentSystemCancelledEmailForAttendee;
            }

            var sb = new StringBuilder();
            foreach (var slot in appointmentDetail.TempAppointmentAvailabilityWindows)
            {
                sb.AppendLine($"• {slot.OnDate:dddd, dd MMM yyyy} – {slot.TimeFrom:hh:mm tt} to {slot.TimeTo:hh:mm tt}");
            }

            string fullName(string first, string last) => string.Join(' ', new[] { first, last }.Where(s => !string.IsNullOrWhiteSpace(s)));
            var placeholderMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["{{PROPOSEDTIMESLOTS}}"] = sb.ToString().TrimEnd(),
                ["{{PARTICIPANT.FIRSTNAME}}"] = user.FirstName ?? string.Empty,
                ["{{PARTICIPANT.LASTNAME}}"] = user.LastName ?? string.Empty,
                ["{{PARTICIPANT.FULLNAME}}"] = fullName(user.FirstName ?? string.Empty, user.LastName ?? string.Empty),
                ["{{HOST.FIRSTNAME}}"] = hostDetails.FirstName ?? string.Empty,
                ["{{HOST.LASTNAME}}"] = hostDetails.LastName ?? string.Empty,
                ["{{HOST.FULLNAME}}"] = fullName(hostDetails.FirstName ?? string.Empty, hostDetails.LastName ?? string.Empty),
                ["{{APPOINTMENT.TITLE}}"] = appointmentDetail.Title,
                ["{{APPOINTMENT.DURATION}}"] = appointmentDetail.DurationMinutes.ToString(),
                ["{{APPOINTMENT.LOCATIONTYPE}}"] = appointmentDetail.LocationType.GetDescription(),
            };

            mailRequest.Subject = ReplaceAll(mailRequest.Subject, placeholderMap);
            mailRequest.Body = ReplaceAll(mailRequest.Body, placeholderMap);

            mailRequest.To = [user.Email!];
            await SendAsync(mailRequest, new CancellationToken());
        }
    }

    public async Task SendCancellationAppointmentScheduleEmail(DefaultIdType id)
    {
        var appointmentDetail = await _applicationDbContext.TempAppointments.Include(x => x.TempAppointmentParticipants)
            .Include(x => x.TempAppointmentAvailabilityWindows).SingleOrDefaultAsync(x => x.Id == id);

        if (appointmentDetail == null || appointmentDetail.AppointmentStatus != Domain.Enums.Appointment.AppointmentStatus.Cancelled
            )
        {
            return;
        }

        var settings = await _settingService.GetSettingByCodeAsync(Domain.Enums.SettingTypes.Appointment);
        var settingsDeserialized = _serializerService.Deserialize<AppointmentSettingModels>(settings.SettingValues);

        var userDetails = await GetUserDetails(appointmentDetail.TempAppointmentParticipants.Select(x => x.FKApplicationUserPKId).ToArray());
        var hostDetails = (await GetUserDetails(appointmentDetail.TempAppointmentParticipants.Where(x => x.AppointmentParticipantRole == Domain.Enums.Appointment.AppointmentParticipantRole.Host).Select(x => x.FKApplicationUserPKId).ToArray()))[0];

        foreach (var user in userDetails)
        {
            if (user.Id.ToString() == appointmentDetail.FKCancelledByApplicationUserPKId)
            {
                continue;
            }

            MailDto mailRequest;
            if (appointmentDetail.TempAppointmentParticipants.Any(x => x.FKApplicationUserPKId == user.Id.ToString() && x.AppointmentParticipantRole == Domain.Enums.Appointment.AppointmentParticipantRole.Host))
            {
                mailRequest = _serializerService.Deserialize<AppointmentSettingModels>(settings.SettingValues).AppointmentCancelledEmailForHost;
            }
            else
            {
                mailRequest = _serializerService.Deserialize<AppointmentSettingModels>(settings.SettingValues).AppointmentCancelledEmailForAttendee;
            }

            var sb = new StringBuilder();
            foreach (var slot in appointmentDetail.TempAppointmentAvailabilityWindows)
            {
                sb.AppendLine($"• {slot.OnDate:dddd, dd MMM yyyy} – {slot.TimeFrom:hh:mm tt} to {slot.TimeTo:hh:mm tt}");
            }

            string fullName(string first, string last) => string.Join(' ', new[] { first, last }.Where(s => !string.IsNullOrWhiteSpace(s)));
            var placeholderMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["{{PROPOSEDTIMESLOTS}}"] = sb.ToString().TrimEnd(),
                ["{{APPOINTMENT.CANCELLATIONREASON}}"] = string.IsNullOrEmpty(appointmentDetail.CancellationReason) ? string.Empty : appointmentDetail.CancellationReason,
                ["{{PARTICIPANT.FIRSTNAME}}"] = user.FirstName ?? string.Empty,
                ["{{PARTICIPANT.LASTNAME}}"] = user.LastName ?? string.Empty,
                ["{{PARTICIPANT.FULLNAME}}"] = fullName(user.FirstName ?? string.Empty, user.LastName ?? string.Empty),
                ["{{HOST.FIRSTNAME}}"] = hostDetails.FirstName ?? string.Empty,
                ["{{HOST.LASTNAME}}"] = hostDetails.LastName ?? string.Empty,
                ["{{HOST.FULLNAME}}"] = fullName(hostDetails.FirstName ?? string.Empty, hostDetails.LastName ?? string.Empty),
                ["{{APPOINTMENT.TITLE}}"] = appointmentDetail.Title,
                ["{{APPOINTMENT.DURATION}}"] = appointmentDetail.DurationMinutes.ToString(),
                ["{{APPOINTMENT.LOCATIONTYPE}}"] = appointmentDetail.LocationType.GetDescription(),
            };

            mailRequest.Subject = ReplaceAll(mailRequest.Subject, placeholderMap);
            mailRequest.Body = ReplaceAll(mailRequest.Body, placeholderMap);

            mailRequest.To = [user.Email!];
            await SendAsync(mailRequest, new CancellationToken());
        }
    }

    public async Task SendRescheduleAppointmentCreatedEmail(DefaultIdType id)
    {
        var appointmentDetail = await _applicationDbContext.TempAppointments.Include(x => x.TempAppointmentParticipants)
           .Include(x => x.TempAppointmentAvailabilityWindows).SingleOrDefaultAsync(x => x.Id == id);

        if (appointmentDetail == null || appointmentDetail.ApprovalRule == Domain.Enums.Appointment.AppointmentApprovalRule.HostConfirms
            )
        {
            return;
        }

        var rescheduleAppointment = appointmentDetail.TempAppointmentAvailabilityWindows.SingleOrDefault(x => x.FKTempAppointmentsPKId == id);
        var appointmentCreatedEmail = await _settingService.GetSettingByCodeAsync(Domain.Enums.SettingTypes.Appointment);

        var appointmentParticipants = appointmentDetail.TempAppointmentParticipants.Where(x => x.AppointmentParticipantRole != Domain.Enums.Appointment.AppointmentParticipantRole.Host);

        var userDetails = await GetUserDetails(appointmentParticipants.Select(x => x.FKApplicationUserPKId).ToArray());
        var hostDetails = (await GetUserDetails(appointmentDetail.TempAppointmentParticipants.Where(x => x.AppointmentParticipantRole == Domain.Enums.Appointment.AppointmentParticipantRole.Host).Select(x => x.FKApplicationUserPKId).ToArray()))[0];

        foreach (var user in userDetails)
        {
            MailDto mailRequest = _serializerService.Deserialize<AppointmentSettingModels>(appointmentCreatedEmail.SettingValues).AppointmentRescheduledEmail;

            var sb = new StringBuilder();
            foreach (var slot in appointmentDetail.TempAppointmentAvailabilityWindows)
            {
                sb.AppendLine($"• {slot.OnDate:dddd, dd MMM yyyy} – {slot.TimeFrom:hh:mm tt} to {slot.TimeTo:hh:mm tt}");
            }

            string fullName(string first, string last) => string.Join(' ', new[] { first, last }.Where(s => !string.IsNullOrWhiteSpace(s)));

            var tempAppointmentParticipant = appointmentParticipants.Single(x => x.FKApplicationUserPKId == user.Id.ToString());

            string uri = string.Format(_frontUserPortalSettings.Urls.AppointmentConfirmationUrl, tempAppointmentParticipant.UrlIdentifier);

            var placeholderMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["{{CONFIRMURL}}"] = uri,
                ["{{PROPOSEDTIMESLOTS}}"] = sb.ToString().TrimEnd(),
                ["{{PARTICIPANT.FIRSTNAME}}"] = user.FirstName ?? string.Empty,
                ["{{PARTICIPANT.LASTNAME}}"] = user.LastName ?? string.Empty,
                ["{{PARTICIPANT.FULLNAME}}"] = fullName(user.FirstName ?? string.Empty, user.LastName ?? string.Empty),
                ["{{HOST.FIRSTNAME}}"] = hostDetails.FirstName ?? string.Empty,
                ["{{HOST.LASTNAME}}"] = hostDetails.LastName ?? string.Empty,
                ["{{HOST.FULLNAME}}"] = fullName(hostDetails.FirstName ?? string.Empty, hostDetails.LastName ?? string.Empty),
                ["{{APPOINTMENT.TITLE}}"] = appointmentDetail.Title,
                ["{{APPOINTMENT.DURATION}}"] = appointmentDetail.DurationMinutes.ToString(),
                ["{{APPOINTMENT.LOCATIONTYPE}}"] = appointmentDetail.LocationType.GetDescription(),
                ["{{APPOINTMENT.RESCHEDULE.ONDATE}}"] = rescheduleAppointment.OnDate.ToString("dddd, dd MMM yyyy") ?? string.Empty,
                ["{{APPOINTMENT.RESCHEDULE.TIMEFROM}}"] = rescheduleAppointment.TimeFrom.ToString("hh:mm tt") ?? string.Empty,
                ["{{APPOINTMENT.RESCHEDULE.TIMETO}}"] = rescheduleAppointment.TimeTo.ToString("hh:mm tt") ?? string.Empty,
            };

            mailRequest.Subject = ReplaceAll(mailRequest.Subject, placeholderMap);
            mailRequest.Body = ReplaceAll(mailRequest.Body, placeholderMap);

            mailRequest.To = [user.Email!];
            await SendAsync(mailRequest, new CancellationToken());
        }
    }

    public async Task SendEmailOnAppointmentApproval(DefaultIdType tempAppointmentPKId, DefaultIdType tempAppointmentParticipantPKId)
    {
        var appointmentDetail = await _applicationDbContext.TempAppointments.Include(x => x.TempAppointmentParticipants).Include(x => x.TempAppointmentAvailabilityWindows)
            .IgnoreQueryFilters().SingleOrDefaultAsync(x => x.Id == tempAppointmentPKId);

        if (appointmentDetail == null)
            return;


        var approvedByParticipant = appointmentDetail.TempAppointmentParticipants.SingleOrDefault(x => x.Id == tempAppointmentParticipantPKId);
        if (approvedByParticipant == null || approvedByParticipant.AppointmentParticipantResponseStatus != Domain.Enums.Appointment.AppointmentParticipantResponseStatus.Accepted)
            return;

        var hostParticipant = appointmentDetail.TempAppointmentParticipants.SingleOrDefault(x => x.AppointmentParticipantRole == Domain.Enums.Appointment.AppointmentParticipantRole.Host);
        if (hostParticipant == null)
            return;

        var settings = await _settingService.GetSettingByCodeAsync(Domain.Enums.SettingTypes.ApprovedAppointment);
        var settingsDeserialized = _serializerService.Deserialize<ApprovedAppointmentSetting>(settings.SettingValues);

        var userDetails = await GetUserDetails(new[] { hostParticipant.FKApplicationUserPKId, approvedByParticipant.FKApplicationUserPKId });
        var hostDetails = userDetails.FirstOrDefault(u => u.Id.ToString() == hostParticipant.FKApplicationUserPKId);
        var participantDetails = userDetails.FirstOrDefault(u => u.Id.ToString() == approvedByParticipant.FKApplicationUserPKId);


        string fullName(string first, string last) => string.Join(' ', new[] { first, last }.Where(s => !string.IsNullOrWhiteSpace(s)));

        var mailToHost = settingsDeserialized.AppointmentConfirmedEmailForHost;
        var hostPlaceholderMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["{{PARTICIPANT.FIRSTNAME}}"] = participantDetails.FirstName ?? string.Empty,
            ["{{PARTICIPANT.LASTNAME}}"] = participantDetails.LastName ?? string.Empty,
            ["{{PARTICIPANT.FULLNAME}}"] = fullName(participantDetails.FirstName ?? string.Empty, participantDetails.LastName ?? string.Empty),

            ["{{HOST.FIRSTNAME}}"] = hostDetails.FirstName ?? string.Empty,
            ["{{HOST.LASTNAME}}"] = hostDetails.LastName ?? string.Empty,
            ["{{HOST.FULLNAME}}"] = fullName(hostDetails.FirstName ?? string.Empty, hostDetails.LastName ?? string.Empty),

            ["{{APPOINTMENT.TITLE}}"] = appointmentDetail.Title,
            ["{{APPOINTMENT.DURATION}}"] = appointmentDetail.DurationMinutes.ToString(),
            ["{{APPOINTMENT.LOCATIONTYPE}}"] = appointmentDetail.LocationType.GetDescription(),

            ["{{APPOINTMENT.APPROVEFORDATE}}"] = approvedByParticipant.ApproveForDate?.ToString("dddd, dd MMM yyyy") ?? "",
            ["{{APPOINTMENT.APPROVETIMEFROM}}"] = approvedByParticipant.ApproveTimeFrom?.ToString("hh:mm tt") ?? "",
            ["{{APPOINTMENT.APPROVETIMETO}}"] = approvedByParticipant.ApproveTimeTo?.ToString("hh:mm tt") ?? "",
        };

        mailToHost.Subject = ReplaceAll(mailToHost.Subject, hostPlaceholderMap);
        mailToHost.Body = ReplaceAll(mailToHost.Body, hostPlaceholderMap);
        mailToHost.To = [hostDetails.Email!];

        await SendAsync(mailToHost, new CancellationToken());

        var mailToParticipant = settingsDeserialized.AppointmentConfirmedEmailForParticipant;
        var participantPlaceholderMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["{{PARTICIPANT.FIRSTNAME}}"] = participantDetails.FirstName ?? string.Empty,
            ["{{PARTICIPANT.LASTNAME}}"] = participantDetails.LastName ?? string.Empty,
            ["{{PARTICIPANT.FULLNAME}}"] = fullName(participantDetails.FirstName ?? string.Empty, participantDetails.LastName ?? string.Empty),

            ["{{HOST.FIRSTNAME}}"] = hostDetails.FirstName ?? string.Empty,
            ["{{HOST.LASTNAME}}"] = hostDetails.LastName ?? string.Empty,
            ["{{HOST.FULLNAME}}"] = fullName(hostDetails.FirstName ?? string.Empty, hostDetails.LastName ?? string.Empty),

            ["{{APPOINTMENT.TITLE}}"] = appointmentDetail.Title,
            ["{{APPOINTMENT.DURATION}}"] = appointmentDetail.DurationMinutes.ToString(),
            ["{{APPOINTMENT.LOCATIONTYPE}}"] = appointmentDetail.LocationType.GetDescription(),
            ["{{APPOINTMENT.APPROVEFORDATE}}"] = approvedByParticipant.ApproveForDate?.ToString("dddd, dd MMM yyyy") ?? "",
            ["{{APPOINTMENT.APPROVETIMEFROM}}"] = approvedByParticipant.ApproveTimeFrom?.ToString("hh:mm tt") ?? "",
            ["{{APPOINTMENT.APPROVETIMETO}}"] = approvedByParticipant.ApproveTimeTo?.ToString("hh:mm tt") ?? "",
        };

        mailToParticipant.Subject = ReplaceAll(mailToParticipant.Subject, participantPlaceholderMap);
        mailToParticipant.Body = ReplaceAll(mailToParticipant.Body, participantPlaceholderMap);
        mailToParticipant.To = [participantDetails.Email!];

        await SendAsync(mailToParticipant, new CancellationToken());
    }

    public async Task SendEmailOnAppointmentDecline(DefaultIdType tempAppointmentPKId, DefaultIdType tempAppointmentParticipantPKId)
    {
        var appointmentDetail = await _applicationDbContext.TempAppointments
            .Include(x => x.TempAppointmentParticipants)
            .Include(x => x.TempAppointmentAvailabilityWindows)
            .IgnoreQueryFilters().SingleOrDefaultAsync(x => x.Id == tempAppointmentPKId);

        if (appointmentDetail == null)
            return;
        var declinedByParticipant = appointmentDetail.TempAppointmentParticipants.SingleOrDefault(x => x.Id == tempAppointmentParticipantPKId);

        if (declinedByParticipant == null || declinedByParticipant.AppointmentParticipantResponseStatus == Domain.Enums.Appointment.AppointmentParticipantResponseStatus.Declined)
            return;

        var hostParticipant = appointmentDetail.TempAppointmentParticipants.SingleOrDefault(x => x.AppointmentParticipantRole == Domain.Enums.Appointment.AppointmentParticipantRole.Host);

        if (hostParticipant == null)
            return;

        var settings = await _settingService.GetSettingByCodeAsync(Domain.Enums.SettingTypes.ApprovedAppointment);
        var settingsDeserialized = _serializerService.Deserialize<ApprovedAppointmentSetting>(settings.SettingValues);

        var userDetails = await GetUserDetails(new[] { hostParticipant.FKApplicationUserPKId, declinedByParticipant.FKApplicationUserPKId });
        var hostDetails = userDetails.FirstOrDefault(u => u.Id.ToString() == hostParticipant.FKApplicationUserPKId);
        var participantDetails = userDetails.FirstOrDefault(u => u.Id.ToString() == declinedByParticipant.FKApplicationUserPKId);

        string fullName(string first, string last) => string.Join(' ', new[] { first, last }.Where(s => !string.IsNullOrWhiteSpace(s)));

        var mailToHost = settingsDeserialized.AppointmentDeclinedEmailForHost;
        var hostPlaceholderMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["{{PARTICIPANT.FIRSTNAME}}"] = participantDetails.FirstName ?? string.Empty,
            ["{{PARTICIPANT.LASTNAME}}"] = participantDetails.LastName ?? string.Empty,
            ["{{PARTICIPANT.FULLNAME}}"] = fullName(participantDetails.FirstName ?? string.Empty, participantDetails.LastName ?? string.Empty),
            ["{{HOST.FIRSTNAME}}"] = hostDetails.FirstName ?? string.Empty,
            ["{{HOST.LASTNAME}}"] = hostDetails.LastName ?? string.Empty,
            ["{{HOST.FULLNAME}}"] = fullName(hostDetails.FirstName ?? string.Empty, hostDetails.LastName ?? string.Empty),
            ["{{APPOINTMENT.TITLE}}"] = appointmentDetail.Title,
            ["{{APPOINTMENT.DURATION}}"] = appointmentDetail.DurationMinutes.ToString(),
            ["{{APPOINTMENT.LOCATIONTYPE}}"] = appointmentDetail.LocationType.GetDescription(),
            ["{{APPOINTMENT.DECLINEDREASON}}"] = string.IsNullOrEmpty(declinedByParticipant.DeclinedReason) ? string.Empty : declinedByParticipant.DeclinedReason,
            ["{{APPOINTMENT.DECLINEDAT}}"] = declinedByParticipant.DeclinedAt?.ToString("dddd, dd MMM yyyy") ?? "",
        };

        mailToHost.Subject = ReplaceAll(mailToHost.Subject, hostPlaceholderMap);
        mailToHost.Body = ReplaceAll(mailToHost.Body, hostPlaceholderMap);
        mailToHost.To = [hostDetails.Email!];

        await SendAsync(mailToHost, new CancellationToken());

        var mailToParticipant = settingsDeserialized.AppointmentDeclinedEmailForParticipant;
        var participantPlaceholderMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["{{PARTICIPANT.FIRSTNAME}}"] = participantDetails.FirstName ?? string.Empty,
            ["{{PARTICIPANT.LASTNAME}}"] = participantDetails.LastName ?? string.Empty,
            ["{{PARTICIPANT.FULLNAME}}"] = fullName(participantDetails.FirstName ?? string.Empty, participantDetails.LastName ?? string.Empty),
            ["{{HOST.FIRSTNAME}}"] = hostDetails.FirstName ?? string.Empty,
            ["{{HOST.LASTNAME}}"] = hostDetails.LastName ?? string.Empty,
            ["{{HOST.FULLNAME}}"] = fullName(hostDetails.FirstName ?? string.Empty, hostDetails.LastName ?? string.Empty),
            ["{{APPOINTMENT.TITLE}}"] = appointmentDetail.Title,
            ["{{APPOINTMENT.DURATION}}"] = appointmentDetail.DurationMinutes.ToString(),
            ["{{APPOINTMENT.LOCATIONTYPE}}"] = appointmentDetail.LocationType.GetDescription(),
            ["{{APPOINTMENT.DECLINEDREASON}}"] = string.IsNullOrEmpty(declinedByParticipant.DeclinedReason) ? string.Empty : declinedByParticipant.DeclinedReason,
            ["{{APPOINTMENT.DECLINEDAT}}"] = declinedByParticipant.DeclinedAt?.ToString("dddd, dd MMM yyyy") ?? "",
        };

        mailToParticipant.Subject = ReplaceAll(mailToParticipant.Subject, participantPlaceholderMap);
        mailToParticipant.Body = ReplaceAll(mailToParticipant.Body, participantPlaceholderMap);
        mailToParticipant.To = [participantDetails.Email!];

        await SendAsync(mailToParticipant, new CancellationToken());
    }
   
    public async Task SendApprovedAppointmentReminder(DefaultIdType tempAppointmentPKId, DefaultIdType tempAppointmentParticipantPKId)
    {
        var appointmentDetail = await _applicationDbContext.TempAppointments
            .Include(x => x.TempAppointmentParticipants)
            .Include(x => x.TempAppointmentAvailabilityWindows)
            .IgnoreQueryFilters().SingleOrDefaultAsync(x => x.Id == tempAppointmentPKId);

        if (appointmentDetail == null)
            return;
        var approvedByParticipant = appointmentDetail.TempAppointmentParticipants.SingleOrDefault(x => x.Id == tempAppointmentParticipantPKId);

        if (approvedByParticipant == null || approvedByParticipant.AppointmentParticipantResponseStatus != Domain.Enums.Appointment.AppointmentParticipantResponseStatus.Accepted)
            return;

        var hostParticipant = appointmentDetail.TempAppointmentParticipants.SingleOrDefault(x => x.AppointmentParticipantRole == Domain.Enums.Appointment.AppointmentParticipantRole.Host);

        if (hostParticipant == null)
            return;

        var settings = await _settingService.GetSettingByCodeAsync(Domain.Enums.SettingTypes.ApprovedAppointment);
        var settingsDeserialized = _serializerService.Deserialize<ApprovedAppointmentSetting>(settings.SettingValues);

        var userDetails = await GetUserDetails(new[] { hostParticipant.FKApplicationUserPKId, approvedByParticipant.FKApplicationUserPKId });
        var hostDetails = userDetails.FirstOrDefault(u => u.Id.ToString() == hostParticipant.FKApplicationUserPKId);
        var participantDetails = userDetails.FirstOrDefault(u => u.Id.ToString() == approvedByParticipant.FKApplicationUserPKId);

        string fullName(string first, string last) => string.Join(' ', new[] { first, last }.Where(s => !string.IsNullOrWhiteSpace(s)));


        // email to host
        var mailToHost = appointmentDetail.LocationType == Domain.Enums.Appointment.AppointmentLocationType.Jitsi ? settingsDeserialized.JitsiConfirmedReminderEmailForHost : settingsDeserialized.ConfirmedReminderEmailForHost;
        string uri = string.Format(_frontUserPortalSettings.Urls.StartMeetingLinkUrl, hostParticipant.MeetingUrlIdentifier);
        var hostPlaceholderMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["{{PARTICIPANT.FIRSTNAME}}"] = participantDetails.FirstName ?? string.Empty,
            ["{{PARTICIPANT.LASTNAME}}"] = participantDetails.LastName ?? string.Empty,
            ["{{PARTICIPANT.FULLNAME}}"] = fullName(participantDetails.FirstName ?? string.Empty, participantDetails.LastName ?? string.Empty),
            ["{{HOST.FIRSTNAME}}"] = hostDetails.FirstName ?? string.Empty,
            ["{{HOST.LASTNAME}}"] = hostDetails.LastName ?? string.Empty,
            ["{{HOST.FULLNAME}}"] = fullName(hostDetails.FirstName ?? string.Empty, hostDetails.LastName ?? string.Empty),
            ["{{APPOINTMENT.TITLE}}"] = appointmentDetail.Title,
            ["{{APPOINTMENT.DURATION}}"] = appointmentDetail.DurationMinutes.ToString(),
            ["{{APPOINTMENT.LOCATIONTYPE}}"] = appointmentDetail.LocationType.GetDescription(),
            ["{{APPOINTMENT.APPROVEFORDATE}}"] = approvedByParticipant.ApproveForDate?.ToString("dddd, dd MMM yyyy") ?? "",
            ["{{APPOINTMENT.APPROVETIMEFROM}}"] = approvedByParticipant.ApproveTimeFrom?.ToString("hh:mm tt") ?? "",
            ["{{APPOINTMENT.APPROVETIMETO}}"] = approvedByParticipant.ApproveTimeTo?.ToString("hh:mm tt") ?? "",
            ["{{APPOINTMENT.MEETINGLINK}}"] = uri,
        };

        mailToHost.Subject = ReplaceAll(mailToHost.Subject, hostPlaceholderMap);
        mailToHost.Body = ReplaceAll(mailToHost.Body, hostPlaceholderMap);
        mailToHost.To = [hostDetails.Email!];

        await SendAsync(mailToHost, new CancellationToken());

        // email to participant
        var mailToParticipant = appointmentDetail.LocationType == Domain.Enums.Appointment.AppointmentLocationType.Jitsi ? settingsDeserialized.JitsiConfirmedReminderEmailForParticipants : settingsDeserialized.ConfirmedReminderEmailForParticipants;
        uri = string.Format(_frontUserPortalSettings.Urls.StartMeetingLinkUrl, approvedByParticipant.MeetingUrlIdentifier);
        var participantPlaceholderMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["{{PARTICIPANT.FIRSTNAME}}"] = participantDetails.FirstName ?? string.Empty,
            ["{{PARTICIPANT.LASTNAME}}"] = participantDetails.LastName ?? string.Empty,
            ["{{PARTICIPANT.FULLNAME}}"] = fullName(participantDetails.FirstName ?? string.Empty, participantDetails.LastName ?? string.Empty),
            ["{{HOST.FIRSTNAME}}"] = hostDetails.FirstName ?? string.Empty,
            ["{{HOST.LASTNAME}}"] = hostDetails.LastName ?? string.Empty,
            ["{{HOST.FULLNAME}}"] = fullName(hostDetails.FirstName ?? string.Empty, hostDetails.LastName ?? string.Empty),
            ["{{APPOINTMENT.TITLE}}"] = appointmentDetail.Title,
            ["{{APPOINTMENT.DURATION}}"] = appointmentDetail.DurationMinutes.ToString(),
            ["{{APPOINTMENT.LOCATIONTYPE}}"] = appointmentDetail.LocationType.GetDescription(),
            ["{{APPOINTMENT.APPROVEFORDATE}}"] = approvedByParticipant.ApproveForDate?.ToString("dddd, dd MMM yyyy") ?? "",
            ["{{APPOINTMENT.APPROVETIMEFROM}}"] = approvedByParticipant.ApproveTimeFrom?.ToString("hh:mm tt") ?? "",
            ["{{APPOINTMENT.APPROVETIMETO}}"] = approvedByParticipant.ApproveTimeTo?.ToString("hh:mm tt") ?? "",
            ["{{APPOINTMENT.MEETINGLINK}}"] = uri,
        };

        mailToParticipant.Subject = ReplaceAll(mailToParticipant.Subject, participantPlaceholderMap);
        mailToParticipant.Body = ReplaceAll(mailToParticipant.Body, participantPlaceholderMap);
        mailToParticipant.To = [participantDetails.Email!];

        await SendAsync(mailToParticipant, new CancellationToken());
    }

}

