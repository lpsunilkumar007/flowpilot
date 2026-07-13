using FlowPilot.Application.Nexus.Identity.Users.Models.Request;
using FlowPilot.Application.Nexus.Setting.Models;
using FlowPilot.Domain.Enums.Nexus;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Mailing;
public partial class MailService
{
    public async Task EmailRegistrationVerificationEmailAsync(string userId, string code, CancellationToken cancellationToken)
    {
        var userDetails = await _nexusDbContext.Users.SingleAsync(x => x.Id == userId);
        await SetCurrentUserAndTenantAsync(userId, cancellationToken);
        var mailRequest = (await _nexusSettingService.GetByCodeAsync<NexusUserSettingModel>(NexusSettingTypes.UserSettings)).RegistrationVerificationEmail;
        string verificationUri = _frontUserPortalSettings.Urls.RegistrationConfirmUrl + "/" + code + "/" + userDetails.Id;
        mailRequest.Body = mailRequest.Body.Replace("{URL}", verificationUri);
        mailRequest.To = new List<string> { userDetails.Email };
        mailRequest.Body = mailRequest.Body.Replace("{FIRSTNAME}", userDetails.FirstName);
        mailRequest.Body = mailRequest.Body.Replace("{LASTNAME}", userDetails.LastName);
        mailRequest.Body = mailRequest.Body.Replace("{FULLNAME}", userDetails.FirstName + " " + userDetails.LastName);
        mailRequest.Body = mailRequest.Body.Replace("{EMAIL}", userDetails.Email);

        await SendAsync(mailRequest, cancellationToken);
    }

    public async Task EmailForgotPasswordAsync(string userId, string code, ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        await SetCurrentUserAndTenantAsync(userId, cancellationToken);
        var mailRequest = (await _nexusSettingService.GetByCodeAsync<NexusUserSettingModel>(NexusSettingTypes.UserSettings)).ForgotPasswordEmail;
        string passwordResetUrl = QueryHelpers.AddQueryString(_frontUserPortalSettings.Urls.ForgotPasswordUrl, "Token", code);
        mailRequest.Body = mailRequest.Body.Replace("{URL}", passwordResetUrl);
        mailRequest.Body = mailRequest.Body.Replace("{CODE}", code);
        var userDetails = await _nexusDbContext.Users.SingleAsync(x => x.Id == userId);
        mailRequest.To = new List<string> { userDetails.Email };
        mailRequest.Body = mailRequest.Body.Replace("{FULLNAME}", userDetails.FirstName + " " + userDetails.LastName);
        await SendAsync(mailRequest, cancellationToken);
    }

    public async Task TwoFactorVerificationEmailAsync(string userId, string code, CancellationToken cancellationToken)
    {
        var userDetails = await _nexusDbContext.Users.SingleAsync(x => x.Id == userId);
        await SetCurrentUserAndTenantAsync(userId, cancellationToken);
        var mailRequest = (await _nexusSettingService.GetByCodeAsync<NexusUserSettingModel>(NexusSettingTypes.UserSettings)).TwoFactorVerificationEmail;       

        mailRequest.To = new List<string> { userDetails.Email! };
        mailRequest.Body = mailRequest.Body.Replace("{CODE}", code);
        mailRequest.Body = mailRequest.Body.Replace("{TWO_FACTOR_SESSION_VALID_FOR_MIN}", _securitySettings.TwoFactorSessionValidForMin.ToString());
        mailRequest.Body = mailRequest.Body.Replace("{FIRSTNAME}", userDetails.FirstName);
        mailRequest.Body = mailRequest.Body.Replace("{LASTNAME}", userDetails.LastName);
        mailRequest.Body = mailRequest.Body.Replace("{FULLNAME}", userDetails.FirstName + " " + userDetails.LastName);
        mailRequest.Body = mailRequest.Body.Replace("{EMAIL}", userDetails.Email);

        await SendAsync(mailRequest, cancellationToken);

    }

}
