using FlowPilot.Application.Nexus.Identity.Tokens.Models.Request;
using FlowPilot.Application.Nexus.Identity.Tokens.Models.Response;

namespace FlowPilot.Application.Nexus.Identity.Tokens;
public interface ITokenService : ITransientService
{
    Task<TokenResponse> GetTokenAsync(TokenRequest request, string ipAddress, CancellationToken cancellationToken, bool isSocialMedia);

    Task<TokenResponse> VerifyTwoFactorAsync(VerifyTwoFactorRequest request, string ipAddress, CancellationToken cancellationToken);

    Task<TokenResponse> GetSocialMediaTokenAsync(SocialMediaTokenRequest request, string ipAddress, CancellationToken cancellationToken);

    Task<TokenResponse> RefreshTokenAsync(RefreshTokenRequest request, string ipAddress);

    Task RequestTwoFactorEmailCodeAsync(string sessionId, CancellationToken cancellationToken);
}