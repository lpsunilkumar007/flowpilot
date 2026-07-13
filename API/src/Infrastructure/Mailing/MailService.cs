using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Application.Common.Mailing;
using FlowPilot.Application.Common.Mailing.Models;
using FlowPilot.Application.Email;
using FlowPilot.Application.Email.Model;
using FlowPilot.Application.Nexus.Identity.Users.Models.Response;
using FlowPilot.Application.Nexus.MultiTenant;
using FlowPilot.Application.Nexus.Setting;
using FlowPilot.Application.Setting;
using FlowPilot.Domain.Email;
using FlowPilot.Infrastructure.Auth;
using FlowPilot.Infrastructure.FrontUserPortal;
using FlowPilot.Infrastructure.Mailing.Aws;
using FlowPilot.Infrastructure.Mailing.Resend;
using FlowPilot.Infrastructure.Mailing.SendGrid;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Infrastructure.Persistence.Context.Nexus;
using MailKit.Net.Smtp;
using MailKit.Security;
using Mapster;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using Resend;
using SendGrid;
using SendGrid.Helpers.Mail;
using EmailAddress = SendGrid.Helpers.Mail.EmailAddress;
namespace FlowPilot.Infrastructure.Mailing;

public partial class MailService : IMailService
{
    private readonly INexusSettingService _nexusSettingService;
    private readonly ISettingService _settingService;
    private readonly SecuritySettings _securitySettings;

    private readonly FrontUserPortalSettings _frontUserPortalSettings;
    private readonly IEmailLogService _emailLogService;
    private readonly ISerializerService _serializerService;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserInitializer _currentUserInitializer;
    public readonly NexusDbContext _nexusDbContext;
    public readonly ApplicationDbContext _applicationDbContext;
    private readonly ISendGridClient _sendGridClient;
    private readonly IResend _resendClient;
    private readonly AwsMailSettings _awsMailSettings;
    private readonly SendGridMailSettings _sendGridMailSettings;
    private readonly ResendMailSettings _resendMailSettings;
    private readonly MailSettings _settings;

    public MailService(IOptions<SecuritySettings> securitySettings, IOptions<MailSettings> settings, IOptions<SendGridMailSettings> sendGridMailSettings, IOptions<AwsMailSettings> awsMailSettings, ISendGridClient sendGridClient, INexusSettingService nexusSettingService, IOptions<FrontUserPortalSettings> frontUserPortalSettings, IEmailLogService emailLogService, ISerializerService serializerService, ITenantService tenantService, ICurrentUserInitializer currentUserInitializer, NexusDbContext nexusDbContext, ApplicationDbContext applicationDbContext, ISettingService settingService, IOptions<ResendMailSettings> resendMailSettings, IResend resendClient)
    {
        _settings = settings.Value;

        _nexusSettingService = nexusSettingService;
        _frontUserPortalSettings = frontUserPortalSettings.Value;
        _emailLogService = emailLogService;
        _serializerService = serializerService;
        _tenantService = tenantService;
        _currentUserInitializer = currentUserInitializer;
        _nexusDbContext = nexusDbContext;
        _applicationDbContext = applicationDbContext;
        _settingService = settingService;
        _awsMailSettings = awsMailSettings.Value;
        _sendGridMailSettings = sendGridMailSettings.Value;
        _sendGridClient = sendGridClient;
        _securitySettings = securitySettings.Value;
        _resendMailSettings = resendMailSettings.Value;
        _resendClient = resendClient;
    }

    private async Task SetCurrentUserAndTenantAsync(string userId, CancellationToken cancellationToken)
    {
        var tenantDto = await _tenantService.GetByUserIdAsync(userId, cancellationToken);
        _currentUserInitializer.SetCurrentUserId(userId);
        _currentUserInitializer.SetCurrentTenant(tenantDto.Id, tenantDto.UniqueId);
    }

    private async Task<List<ViewUserDetailsResponse>> GetUserDetails(string[] userIds)
    {
        var userlist = new List<ViewUserDetailsResponse>();

        var users = await _nexusDbContext.Users
               .AsNoTracking()
               .Where(x => userIds.Contains(x.Id))
               .ToListAsync();

        foreach (var item in users)
        {
            userlist.Add(new ViewUserDetailsResponse
            {
                Id = new Guid(item.Id),
                UserName = item.UserName,
                FirstName = item.FirstName,
                LastName = item.LastName,
                Email = item.Email,
                IsActive = item.IsActive,
                EmailConfirmed = item.EmailConfirmed,
                PhoneNumber = item.PhoneNumber,
                ImageUrl = item.ImageUrl,
                TimeZone = item.TimeZone,
            });
        }

        return userlist.Adapt<List<ViewUserDetailsResponse>>();
    }

    private string ReplaceAll(string input, IDictionary<string, string> map)
    {
        if (string.IsNullOrEmpty(input)) return input ?? string.Empty;
        foreach (var kv in map)
            input = input.Replace(kv.Key, kv.Value);
        return input;
    }

    public async Task<SendEmailResponseDto> SendAsync(MailDto request, CancellationToken cancellationToken = default)
    {
        bool isSent = false;
        List<string> emailIds = new List<string>();
        emailIds.AddRange(request.To);
        if(request.Cc!=null)
            emailIds.AddRange(request.Cc);
        if(request.Bcc != null)
            emailIds.AddRange(request.Bcc);
        var userDetails = await GetUserDetailsByEmail(emailIds);
        if (userDetails == null)
        {
            userDetails = [];
        }

        EmailLog log = new EmailLog
        {
            To = request.To,
            Subject = request.Subject,
            Body = request.Body,
            EmailType = request.EmailType,
            From = request.From,
            DisplayName = request.DisplayName,
            ReplyTo = request.ReplyTo,
            ReplyToName = request.ReplyToName,
            Bcc = request.Bcc == null ? null : request.Bcc,
            Cc = request.Cc == null ? null : request.Cc,
            Headers = request.Headers == null ? null : string.Join(",", request.Headers),
            EmailSmtpUsed = _serializerService.Serialize(_settings),
            IsTestModeEnabled = false,
            EmailToUserIds = userDetails.Where(x => request.To.Contains(x.Email)).Select(x => x.Id).ToList(),
            EmailBccUserIds = request.Bcc == null ? [] : userDetails.Where(x => request.Bcc.Contains(x.Email)).Select(x => x.Id).ToList(),
            EmailCcUserIds = request.Cc == null ? [] : userDetails.Where(x => request.Cc.Contains(x.Email)).Select(x => x.Id).ToList(),

        };
        if (_settings.Provider.Equals("SendGrid", StringComparison.OrdinalIgnoreCase))
        {
            var sg = _sendGridMailSettings;
            if (sg.IsTestModeEnabled)
            {
                ApplyTestModeOverride(request, sg.TestModeEmailTo, sg.TestModeEmailCc, sg.TestModeEmailBCc);
                log.To = sg.TestModeEmailTo;
                log.Subject = request.Subject;
                log.From = string.IsNullOrEmpty(request.From) ? sg.FromEmail : request.From;
                log.DisplayName = string.IsNullOrEmpty(request.DisplayName) ? string.Empty : request.From;
                log.Bcc = sg.TestModeEmailBCc == null ? null : sg.TestModeEmailBCc;
                log.Cc = sg.TestModeEmailCc == null ? null : sg.TestModeEmailCc;
            }

            log.EmailSmtpUsed = _serializerService.Serialize(sg);
            log.IsTestModeEnabled = sg.IsTestModeEnabled;

            var (sendGridSuccess, sendGridMsgId, message) = await SendViaSendGridAsync(request, cancellationToken);

            log.IsEmailSent = sendGridSuccess;
            log.EmailSentMessage = message;
            log.SendGridMessageId = sendGridMsgId.ToLower().Trim();
            isSent = sendGridSuccess;
        }
        else if (_settings.Provider.Equals("Aws", StringComparison.OrdinalIgnoreCase))
        {
            var aws = _awsMailSettings;
            if (aws.IsTestModeEnabled)
            {
                ApplyTestModeOverride(request, aws.TestModeEmailTo, aws.TestModeEmailCc, aws.TestModeEmailBCc);
                log.To = aws.TestModeEmailTo;
                log.Subject = request.Subject;
                log.From = string.IsNullOrEmpty(request.From) ? aws.AWSUsername : request.From;
                log.DisplayName = string.IsNullOrEmpty(request.DisplayName) ? string.Empty : request.From;
                log.Bcc = aws.TestModeEmailBCc == null ? null : aws.TestModeEmailBCc;
                log.Cc = aws.TestModeEmailCc == null ? null : aws.TestModeEmailCc;
            }

            log.EmailSmtpUsed = _serializerService.Serialize(aws);
            log.IsTestModeEnabled = aws.IsTestModeEnabled;

            var (smtpSuccess, message) = await SendViaAwsAsync(request, aws, cancellationToken);

            log.IsEmailSent = smtpSuccess;
            log.EmailSentMessage = message;
            isSent = smtpSuccess;
        }
        else if (_settings.Provider.Equals("Resend", StringComparison.OrdinalIgnoreCase))
        {
            var resend = _resendMailSettings;
            if (resend.IsTestModeEnabled)
            {
                ApplyTestModeOverride(request, resend.TestModeEmailTo, resend.TestModeEmailCc, resend.TestModeEmailBCc);
                log.To = resend.TestModeEmailTo;
                log.Subject = request.Subject;
                log.From = string.IsNullOrEmpty(request.From) ? resend.FromEmail : request.From;
                log.DisplayName = string.IsNullOrEmpty(request.DisplayName) ? string.Empty : request.From;
                log.Bcc = resend.TestModeEmailBCc == null ? null : resend.TestModeEmailBCc;
                log.Cc = resend.TestModeEmailCc == null ? null : resend.TestModeEmailCc;
            }

            log.EmailSmtpUsed = _serializerService.Serialize(resend);
            log.IsTestModeEnabled = resend.IsTestModeEnabled;

            var (resendSuccess, resendMsgId, resendMessage) = await SendViaResendAsync(request, cancellationToken);

            log.IsEmailSent = resendSuccess;
            log.EmailSentMessage = resendMessage;
            log.From = string.IsNullOrEmpty(request.From) ? resend.FromEmail : request.From;
            isSent = resendSuccess;
        }
        else
        {
            throw new NotSupportedException($"Email provider '{_settings.Provider}' is not supported.");
        }

        log.IsEmailSent = isSent;
        await _emailLogService.AddEmailLogAsync(log);

        return new SendEmailResponseDto { EmailLogId = log.Id, IsEmailSent = log.IsEmailSent };
    }

    private async Task<(bool IsSent, string? SendGridMessageId, string? ErrorMessage)> SendViaSendGridAsync(MailDto request, CancellationToken cancellationToken)
    {
        try
        {
            var sgSettings = _sendGridMailSettings;
            var from = new EmailAddress(string.IsNullOrEmpty(request.From) ? sgSettings.FromEmail : request.From, request.DisplayName ?? string.Empty);
            var msg = MailHelper.CreateSingleEmailToMultipleRecipients(
                from,
                request.To.Select(to => new EmailAddress(to)).ToList(),
                request.Subject,
                null,
                request.Body,
                false
            );

            if (request.Cc != null)
                msg.AddCcs(request.Cc.Where(cc => !string.IsNullOrWhiteSpace(cc)).Select(cc => new EmailAddress(cc)).ToList());

            if (request.Bcc != null)
                msg.AddBccs(request.Bcc.Where(bcc => !string.IsNullOrWhiteSpace(bcc)).Select(bcc => new EmailAddress(bcc)).ToList());

            if (request.Headers != null)
            {
                foreach (var header in request.Headers)
                    msg.Headers.Add(header.Key, header.Value);
            }

            if (request.AttachmentData != null)
            {
                foreach (var att in request.AttachmentData)
                {
                    msg.AddAttachment(att.Key, Convert.ToBase64String(att.Value));
                }
            }

            var response = await _sendGridClient.SendEmailAsync(msg, cancellationToken);

            if (response.StatusCode != System.Net.HttpStatusCode.Accepted)
            {
                string responseBody = await response.Body.ReadAsStringAsync();
                return (false, null, $"SendGrid Error: {response.StatusCode}, {responseBody}");
            }

            // Extract SendGrid Message ID
            if (response.Headers.TryGetValues("X-Message-Id", out var values))
            {
                return (true, values.FirstOrDefault(), "Email sent successfully via SendGrid");
            }

            return (true, null, "Email sent successfully via SendGrid");

        }
        catch (Exception ex)
        {
            return (false, null, ex.Message);
        }

    }

    private async Task<(bool IsSent, string? ErrorMessage)> SendViaAwsAsync(MailDto request, AwsMailSettings awsSettings, CancellationToken cancellationToken)
    {
        try
        {
            var email = new MimeMessage();
            var from = request.From ?? awsSettings.AWSUsername;
            email.From.Add(new MailboxAddress(request.DisplayName ?? string.Empty, from));
            email.Sender = new MailboxAddress(request.DisplayName ?? string.Empty, from);
            email.Subject = request.Subject;

            foreach (var to in request.To)
                email.To.Add(MailboxAddress.Parse(to));

            if (!string.IsNullOrEmpty(request.ReplyTo))
                email.ReplyTo.Add(new MailboxAddress(request.ReplyToName, request.ReplyTo));

            if (request.Cc != null)
            {
                foreach (var cc in request.Cc.Where(cc => !string.IsNullOrWhiteSpace(cc)))
                    email.Cc.Add(MailboxAddress.Parse(cc.Trim()));
            }

            if (request.Bcc != null)
            {
                foreach (var bcc in request.Bcc.Where(bcc => !string.IsNullOrWhiteSpace(bcc)))
                    email.Bcc.Add(MailboxAddress.Parse(bcc.Trim()));
            }

            if (request.Headers != null)
            {
                foreach (var header in request.Headers)
                    email.Headers.Add(header.Key, header.Value);
            }

            var builder = new BodyBuilder
            {
                HtmlBody = request.Body
            };

            if (request.AttachmentData != null)
            {
                foreach (var att in request.AttachmentData)
                    builder.Attachments.Add(att.Key, att.Value);
            }

            email.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(awsSettings.EmailHost, int.Parse(awsSettings.SendEmailPort), awsSettings.SendEmailEnableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None, cancellationToken);
            await smtp.AuthenticateAsync(awsSettings.AWSUsername, awsSettings.AWSPassword, cancellationToken);
            await smtp.SendAsync(email, cancellationToken);
            await smtp.DisconnectAsync(true, cancellationToken);

            return (true, "Email sent successfully via SMTP");
        }
        catch (Exception exception)
        {
            string emailSentMessage = exception.Message.Trim() + "\n" + (exception.InnerException != null ? exception.InnerException.Message.Trim() : string.Empty);
            return (false, emailSentMessage);
        }


    }


    private async Task<(bool IsSent, string? MessageId, string? ErrorMessage)> SendViaResendAsync(MailDto request, CancellationToken cancellationToken)
    {
        try
        {
            var settings = _resendMailSettings;

            var toList = settings.IsTestModeEnabled ? settings.TestModeEmailTo : request.To;

            var ccList = settings.IsTestModeEnabled ? settings.TestModeEmailCc : request.Cc;

            var bccList = settings.IsTestModeEnabled ? settings.TestModeEmailBCc : request.Bcc;

            string fromAddress = !string.IsNullOrEmpty(request.From) ? request.From : settings.FromEmail;

            string fromFormatted = string.IsNullOrEmpty(request.DisplayName) ? fromAddress : $"{request.DisplayName} <{fromAddress}>";

            var message = new EmailMessage
            {
                From = fromFormatted,
                Subject = request.Subject,
                HtmlBody = request.Body,
                To = EmailAddressList.From(toList?.Where(x => !string.IsNullOrWhiteSpace(x)) ?? []),
                Cc = EmailAddressList.From(ccList?.Where(x => !string.IsNullOrWhiteSpace(x)) ?? []),
                Bcc = EmailAddressList.From(bccList?.Where(x => !string.IsNullOrWhiteSpace(x)) ?? [])
            };

            if (!string.IsNullOrWhiteSpace(request.ReplyTo))
            {
                message.ReplyTo = EmailAddressList.From(
                    new[] {
                    string.IsNullOrEmpty(request.ReplyToName)
                        ? request.ReplyTo
                        : $"{request.ReplyToName} <{request.ReplyTo}>"
                    }
                );
            }

            if (request.AttachmentData != null)
            {
                foreach (var att in request.AttachmentData)
                {
                    message.Attachments.Add(new EmailAttachment
                    {
                        Filename = att.Key,
                        Content = Convert.ToBase64String(att.Value)
                    });
                }
            }

            var response = await _resendClient.EmailSendAsync(message, cancellationToken);

            return (true, null, "Email sent successfully via Resend");
        }
        catch (Exception ex)
        {
            return (false, null, ex.Message);
        }
    }
    private void ApplyTestModeOverride(MailDto request, List<string> to, List<string> cc, List<string> bcc)
    {
        request.To = to ?? new List<string>();
        request.Cc = cc ?? new List<string>();
        request.Bcc = bcc ?? new List<string>();
        request.Subject = "[TEST] " + request.Subject;
    }


    private async Task<List<ViewUserDetailsResponse>> GetUserDetailsByEmail(List<string> emailIds)
    {
        var userlist = new List<ViewUserDetailsResponse>();

        var users = await _nexusDbContext.Users
               .AsNoTracking()
               .Where(x => emailIds.Contains(x.Email))
               .ToListAsync();

        foreach (var item in users)
        {
            userlist.Add(new ViewUserDetailsResponse
            {
                Id = new Guid(item.Id),
                UserName = item.UserName,
                FirstName = item.FirstName,
                LastName = item.LastName,
                Email = item.Email,
                IsActive = item.IsActive,
                EmailConfirmed = item.EmailConfirmed,
                PhoneNumber = item.PhoneNumber,
                ImageUrl = item.ImageUrl,
                TimeZone = item.TimeZone,
            });
        }

        return userlist.Adapt<List<ViewUserDetailsResponse>>();
    }
}
