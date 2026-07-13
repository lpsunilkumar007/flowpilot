using FlowPilot.Application.Nexus.Identity.Tokens;
using FlowPilot.Application.Nexus.Identity.Tokens.Models.Request;
using FlowPilot.Application.Nexus.Identity.Tokens.Models.Response;
using FlowPilot.Host.Controllers.BaseControllers;

namespace FlowPilot.Host.Controllers.Identity;

public sealed class TokensController : VersionNeutralApiController
{
    private readonly ITokenService _tokenService;

    public TokensController(ITokenService tokenService) => _tokenService = tokenService;

    [HttpPost]
    [AllowAnonymous]
    [OpenApiOperation("Request an access token using credentials.", "")]
    public Task<TokenResponse> GetTokenAsync(TokenRequest request, CancellationToken cancellationToken)
    {
        return _tokenService.GetTokenAsync(request, GetIpAddress()!, cancellationToken, false);
    }

    [HttpPost("verify-two-factor")]
    [AllowAnonymous]
    public Task<TokenResponse> VerifyTwoFactorAsync(VerifyTwoFactorRequest request, CancellationToken cancellationToken)
    {
        return _tokenService.VerifyTwoFactorAsync(request, GetIpAddress()!, cancellationToken);
    }

    [HttpPost("request-two-factor-email-code/{sessionId}")]
    [AllowAnonymous]
    public async Task RequestTwoFactorEmailCodeAsync(string sessionId, CancellationToken cancellationToken)
    {
        await _tokenService.RequestTwoFactorEmailCodeAsync(sessionId, cancellationToken);
    }


    [HttpPost("refresh")]
    [AllowAnonymous]
    [OpenApiOperation("Request an access token using a refresh token.", "")]
    public Task<TokenResponse> RefreshAsync(RefreshTokenRequest request)
    {
        return _tokenService.RefreshTokenAsync(request, GetIpAddress()!);
    }

    [HttpPost("social-medial-login")]
    [AllowAnonymous]
    public Task<TokenResponse> GetSocialMediaTokenAsync(SocialMediaTokenRequest request, CancellationToken cancellationToken)
    {
        return _tokenService.GetSocialMediaTokenAsync(request, GetIpAddress()!, cancellationToken);
    }

    private string? GetIpAddress() =>
        Request.Headers.ContainsKey("X-Forwarded-For")
            ? Request.Headers["X-Forwarded-For"]
            : HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "N/A";
}
