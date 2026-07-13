using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Nexus.Identity.Users.Models.Request;
using FlowPilot.Infrastructure.Nexus.Identity.Extensions;
using FlowPilot.Infrastructure.SystemConstants;

namespace FlowPilot.Infrastructure.Nexus.Identity;
internal partial class UserService
{
    public async Task<string> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email.Normalize()) ?? throw new BadRequestException(ErrorMessages.GenericError);

        string code = await _userManager.GeneratePasswordResetTokenAsync(user);

        _jobService.Enqueue(() => _mailService.EmailForgotPasswordAsync(user.Id, code, request, CancellationToken.None));
        return SuccessMessages.ForgotPassword;
    }

    public async Task<string> ResetPasswordAsync(ResetForgotPasswordRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email.Normalize()) ?? throw new BadRequestException(ErrorMessages.GenericError);

        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.Password);
        if (!result.Succeeded)
        {
            throw new BadRequestException(ErrorMessages.IdentityValidationError, result.GetErrors());
        }

        return SuccessMessages.ForgotPasswordReset;
    }

    public async Task<string> ChangePasswordAsync(ChangePasswordRequest model, string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        _ = user ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "User"));

        var result = await _userManager.ChangePasswordAsync(user, model.Password, model.NewPassword);

        if (!result.Succeeded)
        {
            throw new BadRequestException(ErrorMessages.ChangePasswordFailed, result.GetErrors());
        }
        return SuccessMessages.PasswordChanged;
    }

    public async Task<string> ChangePasswordForcefullyAsync(ChangePasswordForcefullyRequest model, string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        _ = user ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "User"));

        string token = await _userManager.GeneratePasswordResetTokenAsync(user);

        var result = await _userManager.ResetPasswordAsync(user, token, model.NewPassword);
        if (!result.Succeeded)
        {
            throw new BadRequestException(ErrorMessages.IdentityValidationError, result.GetErrors());
        }

        return SuccessMessages.ForgotPasswordReset;
    }

}
