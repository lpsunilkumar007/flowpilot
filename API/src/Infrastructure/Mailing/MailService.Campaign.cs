using System.Net;
using FlowPilot.Application.Common.Mailing.Models;
using FlowPilot.Domain.CRM;
using FlowPilot.Domain.Enums;
using FlowPilot.Domain.Enums.CRM;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Mailing;

public partial class MailService
{
    public async Task SendCampaignEmail(DefaultIdType campaignId)
    {
        var campaign = await _applicationDbContext.Campaigns
            .AsNoTracking()
            .Include(x => x.EmailTemplate)
            .Include(x => x.CampaignUsers)
            .SingleOrDefaultAsync(x => x.Id == campaignId);

        if (campaign is null
            || campaign.CampaignType != CampaignType.Email
            || campaign.CampaignUsers.Count == 0
            || campaign.EmailTemplate is null)
        {
            return;
        }

        if (campaign.ScheduleDate > DateTimeOffset.UtcNow.AddMinutes(1))
        {
            return;
        }

        var leadIds = campaign.CampaignUsers.Select(x => x.UserId).Distinct().ToList();
        var leads = await _applicationDbContext.Leads
            .AsNoTracking()
            .Include(x => x.LeadContacts)
            .Include(x => x.LeadSource)
            .Include(x => x.LeadStatus)
            .Where(x => leadIds.Contains(x.Id))
            .ToListAsync();

        var leadsById = leads.ToDictionary(x => x.Id);

        var assignedUserIds = leads
            .Select(x => x.FKAssignedToUserId)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x!)
            .Distinct()
            .ToArray();

        var assignedUsers = assignedUserIds.Length == 0
            ? []
            : await GetUserDetails(assignedUserIds);
        var assignedById = assignedUsers.ToDictionary(x => x.Id.ToString(), StringComparer.OrdinalIgnoreCase);

        var (from, displayName) = GetCampaignSender();

        foreach (var recipient in campaign.CampaignUsers)
        {
            if (string.IsNullOrWhiteSpace(recipient.Contact))
            {
                continue;
            }

            try
            {
                leadsById.TryGetValue(recipient.UserId, out var lead);
                var primaryContact = GetPrimaryContact(lead);

                var assignedTo = string.Empty;
                if (lead != null
                    && !string.IsNullOrWhiteSpace(lead.FKAssignedToUserId)
                    && assignedById.TryGetValue(lead.FKAssignedToUserId, out var assignedUser))
                {
                    assignedTo = $"{assignedUser.FirstName} {assignedUser.LastName}".Trim();
                }

                var formattedMessage = FormatCampaignMessageHtml(campaign.Message);
                var placeholderMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
                {
                    ["{{CAMPAIGN.TITLE}}"] = campaign.Title,
                    ["{{CAMPAIGN.MESSAGE}}"] = formattedMessage,
                    ["{{RECIPIENT.EMAIL}}"] = recipient.Contact,
                    ["{{UserName}}"] = assignedTo,
                    ["{{LeadName}}"] = lead?.BusinessName ?? string.Empty,
                    ["{{CompanyName}}"] = lead?.BusinessName ?? string.Empty,
                    ["{{LeadEmail}}"] = primaryContact?.Email ?? string.Empty,
                    ["{{LeadPhone}}"] = primaryContact?.Mobile ?? string.Empty,
                    ["{{LeadSource}}"] = lead?.LeadSource?.LookUpValue ?? string.Empty,
                    ["{{LeadStatus}}"] = lead?.LeadStatus?.LookUpValue ?? string.Empty,
                    ["{{AssignedTo}}"] = assignedTo,
                };

                var body = ReplaceAll(campaign.EmailTemplate.EmailBody, placeholderMap);
                if (!string.IsNullOrWhiteSpace(formattedMessage)
                    && !EmailBodyHasCampaignMessageToken(campaign.EmailTemplate.EmailBody))
                {
                    body += $"<p>{formattedMessage}</p>";
                }

                var mailRequest = new MailDto
                {
                    To = [recipient.Contact],
                    Subject = ReplaceAll(campaign.EmailTemplate.EmailSubject, placeholderMap),
                    Body = body,
                    EmailType = EmailTypes.CampaignEmail,
                    From = from,
                    DisplayName = displayName,
                };

                await SendAsync(mailRequest, CancellationToken.None);
            }
            catch
            {
                // Continue sending remaining recipients if one fails.
            }
        }
    }

    private static LeadContacts? GetPrimaryContact(Leads? lead) =>
        lead?.LeadContacts.FirstOrDefault(c => c.IsPrimary)
        ?? lead?.LeadContacts.FirstOrDefault();

    private static string FormatCampaignMessageHtml(string? message)
    {
        if (string.IsNullOrWhiteSpace(message))
        {
            return string.Empty;
        }

        var encoded = WebUtility.HtmlEncode(message.Trim());
        return encoded
            .Replace("\r\n", "<br/>")
            .Replace("\n", "<br/>")
            .Replace("\r", "<br/>");
    }

    private static bool EmailBodyHasCampaignMessageToken(string? emailBody) =>
        !string.IsNullOrEmpty(emailBody)
        && emailBody.Contains("{{CAMPAIGN.MESSAGE}}", StringComparison.OrdinalIgnoreCase);

    private (string From, string DisplayName) GetCampaignSender()
    {
        if (_settings.Provider.Equals("SendGrid", StringComparison.OrdinalIgnoreCase))
        {
            return (_sendGridMailSettings.FromEmail, _sendGridMailSettings.FromEmail);
        }

        if (_settings.Provider.Equals("Aws", StringComparison.OrdinalIgnoreCase))
        {
            return (_awsMailSettings.AWSUsername, _awsMailSettings.AWSUsername);
        }

        if (_settings.Provider.Equals("Resend", StringComparison.OrdinalIgnoreCase))
        {
            return (_resendMailSettings.FromEmail, _resendMailSettings.FromEmail);
        }

        if (_settings.Provider.Equals("Smtp", StringComparison.OrdinalIgnoreCase))
        {
            return (_smtpMailSetting.From, _smtpMailSetting.DisplayName);
        }

        return (string.Empty, string.Empty);
    }
}
