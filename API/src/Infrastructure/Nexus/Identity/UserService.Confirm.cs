using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Infrastructure.SystemConstants;
using System.Text;

namespace FlowPilot.Infrastructure.Nexus.Identity;
internal partial class UserService
{
    public async Task<string> ConfirmEmailAsync(string userId, string code, CancellationToken cancellationToken)
    {
        var user = await _userManager.Users
            .Where(u => u.Id == userId && !u.EmailConfirmed)
            .FirstOrDefaultAsync(cancellationToken);

        _ = user ?? throw new BadRequestException(ErrorMessages.ConfirmEmail);

        code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(code));
        var result = await _userManager.ConfirmEmailAsync(user, code);

        return result.Succeeded
            ? string.Format(SuccessMessages.ConfirmEmail, user.Email)
            : throw new BadRequestException(ErrorMessages.ConfirmEmail);
    }
}
