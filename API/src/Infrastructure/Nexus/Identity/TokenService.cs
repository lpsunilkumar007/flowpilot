using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Application.Common.Mailing;
using FlowPilot.Application.Nexus.Identity.Tokens;
using FlowPilot.Application.Nexus.Identity.Tokens.Models.Request;
using FlowPilot.Application.Nexus.Identity.Tokens.Models.Response;
using FlowPilot.Application.Nexus.Identity.Users;
using FlowPilot.Application.Nexus.Identity.Users.Models.Request;
using FlowPilot.Infrastructure.Auth;
using FlowPilot.Infrastructure.Auth.Jwt;
using FlowPilot.Infrastructure.Nexus.Identity.DbModels;
using FlowPilot.Infrastructure.Persistence.Context.Nexus;
using FlowPilot.Infrastructure.SystemConstants;
using FlowPilot.Shared.Authorization;
using FlowPilot.Shared.Nexus;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using OtpNet;

namespace FlowPilot.Infrastructure.Nexus.Identity;
internal class TokenService : ITokenService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SecuritySettings _securitySettings;
    private readonly JwtSettings _jwtSettings;
    private readonly ISerializerService _serializerService;
    private readonly IUserService _userService;
    private readonly NexusDbContext _nexusDbContext;
    private readonly IMailService _mailService;
    private readonly IJobService _jobService;
    private readonly IDateTimeService _dateTimeService;

    public TokenService(
        UserManager<ApplicationUser> userManager,
        IOptions<JwtSettings> jwtSettings,
        IOptions<SecuritySettings> securitySettings,
        ISerializerService serializerService,
        IUserService userService,
        NexusDbContext nexusDbContext,
        IMailService mailService,
        IJobService jobService,
        IDateTimeService dateTimeService
        )
    {
        _userManager = userManager;
        _jwtSettings = jwtSettings.Value;
        _securitySettings = securitySettings.Value;
        _serializerService = serializerService;
        _userService = userService;
        _nexusDbContext = nexusDbContext;
        _dateTimeService = dateTimeService;
        _mailService = mailService;
        _jobService = jobService;
    }

    public async Task<TokenResponse> GetTokenAsync(TokenRequest request, string ipAddress, CancellationToken cancellationToken, bool isSocialMedia)
    {
        if (await _userManager.Users.Include(u => u.Tenant).FirstOrDefaultAsync(u => u.Email == request.Email.Trim().Normalize()) is not { } user)
        {
            throw new BadRequestException(ErrorMessages.AuthenticationFailed);
        }

        if (!isSocialMedia && !await _userManager.CheckPasswordAsync(user, request.Password))
        {
            throw new BadRequestException(ErrorMessages.AuthenticationFailed);
        }

        if (!user.IsActive)
        {
            throw new BadRequestException(ErrorMessages.AuthenticationUserNotActive);
        }

        if (_securitySettings.RequireConfirmedAccount && !user.EmailConfirmed)
        {
            throw new BadRequestException(ErrorMessages.AuthenticationEmailNotConfirmed);
        }

        if (user.Tenant.UniqueId != NexusConstants.Root.TenantUniqueId && !user.Tenant.IsActive)
        {
            throw new BadRequestException(ErrorMessages.AuthenticationTenantNotActive);
        }

        if (_securitySettings.RequiresTwoFactorAuthentication && await _userManager.GetTwoFactorEnabledAsync(user))
        {
            // Create session
            var session = new ApplicationUserTwoFactorSession
            {
                SessionId = Guid.NewGuid(),
                FKApplicationUserPKId = user.Id,
                Provider = user.UserTwoFactorAuthenticationType == Domain.Enums.Nexus.UserTwoFactorAuthenticationTypes.Authenticator ? TokenOptions.DefaultAuthenticatorProvider : TokenOptions.DefaultEmailProvider,
                ExpiresAtUtc = DateTimeOffset.UtcNow.AddMinutes(_securitySettings.TwoFactorSessionValidForMin),
                Attempts = 0,
                Used = false
            };

            _nexusDbContext.ApplicationUserTwoFactorSession.Add(session);
            await _nexusDbContext.SaveChangesAsync(cancellationToken);

            if (user.UserTwoFactorAuthenticationType == Domain.Enums.Nexus.UserTwoFactorAuthenticationTypes.Email)
            {
                string code = await _userManager.GenerateTwoFactorTokenAsync(user, session.Provider);
                _jobService.Enqueue(() => _mailService.TwoFactorVerificationEmailAsync(user.Id, code, CancellationToken.None));
            }

            return new TokenResponse(RequiresTwoFactor: true, TwoFactorSessionId: session.SessionId.ToString(), Token: "NA", RefreshToken: "NA", RefreshTokenExpiryTime: DateTime.Now.AddDays(-10));
        }

        return await GenerateTokensAndUpdateUser(user, ipAddress);
    }

    public async Task<TokenResponse> GetSocialMediaTokenAsync(SocialMediaTokenRequest request, string ipAddress, CancellationToken cancellationToken)
    {
        string email = string.Empty;

        RegisterUserRequest? registerUserRequest = null;
        RegisterUserSocialMedialRequestDto registerUserSocialMedialRequestDto = new RegisterUserSocialMedialRequestDto();
        string password = Guid.NewGuid() + "123Pa$$word!";
        switch (request.SocialMediaType)
        {
            case Domain.Enums.Nexus.UserRegistrationType.Facebook:
                var facebookData = _serializerService.Deserialize<FacebookResponseDto>(request.JsonResponse);
                email = facebookData.email;
                var fullName = facebookData.name?.Trim() ?? string.Empty;
                var parts = fullName.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);

                registerUserRequest = new RegisterUserRequest
                {
                    FirstName = parts.Length > 0 ? parts[0] : string.Empty,
                    LastName = parts.Length > 1 ? parts[parts.Length - 1] : string.Empty,
                    Email = facebookData.email,
                    ConfirmPassword = password,
                    Password = password,
                };

                registerUserSocialMedialRequestDto.FacebookJson = request.JsonResponse;
                break;

            case Domain.Enums.Nexus.UserRegistrationType.Google:
                var googleData = _serializerService.Deserialize<GoogleResponseDto>(request.JsonResponse);
                email = googleData.email;
                var googleFullName = googleData.name?.Trim() ?? string.Empty;
                var googleParts = googleFullName.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);

                registerUserRequest = new RegisterUserRequest
                {
                    FirstName = googleParts.Length > 0 ? googleParts[0] : string.Empty,
                    LastName = googleParts.Length > 1 ? googleParts[googleParts.Length - 1] : string.Empty,
                    Email = googleData.email,
                    ConfirmPassword = password,
                    Password = password,
                };
                registerUserSocialMedialRequestDto.GoogleJson = request.JsonResponse;
                break;
            default:
                throw new CustomNotImplementedException($"{request.SocialMediaType.ToString()} not setup");
        }

        if (registerUserRequest is null)
        {
            throw new BadRequestException(ErrorMessages.GenericMessage);
        }

        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null)
        {
            var response = await _userService.RegisterUserAsync(registerUserRequest, request.SocialMediaType, registerUserSocialMedialRequestDto);
        }

        var tokenrequest = new TokenRequest(email, string.Empty);
        return await GetTokenAsync(tokenrequest, ipAddress, cancellationToken, true);

    }

    public async Task<TokenResponse> RefreshTokenAsync(RefreshTokenRequest request, string ipAddress)
    {
        var userPrincipal = GetPrincipalFromExpiredToken(request.Token);
        string? userEmail = userPrincipal.GetEmail();
        var user = await _userManager.FindByEmailAsync(userEmail!);
        if (user is null)
        {
            throw new BadRequestException(ErrorMessages.AuthenticationFailed);
        }

        if (user.RefreshToken != request.RefreshToken || user.RefreshTokenExpiryTime <= DateTimeOffset.UtcNow)
        {
            throw new BadRequestException(ErrorMessages.AuthenticationInvalidRefreshToken);
        }

        return await GenerateTokensAndUpdateUser(user, ipAddress);
    }

    public async Task<TokenResponse> VerifyTwoFactorAsync(VerifyTwoFactorRequest request, string ipAddress, CancellationToken cancellationToken)
    {
        var sessionId = Guid.Parse(request.TwoFactorSessionId);

        var session = await _nexusDbContext.ApplicationUserTwoFactorSession.Include(x => x.ApplicationUsers)
            .FirstOrDefaultAsync(x => x.SessionId == sessionId && x.Used == false, cancellationToken);

        if (session is null || session.ExpiresAtUtc < _dateTimeService.UtcNow)
            throw new BadRequestException(ErrorMessages.TwoFactorAuthenticationSessionExpired);

        var user = await _userManager.Users.Include(u => u.Tenant).FirstOrDefaultAsync(u => u.Email == session.ApplicationUsers.Email, cancellationToken);
        if (user is null)
            throw new BadRequestException(ErrorMessages.AuthenticationFailed);

        session.Attempts++;
        await _nexusDbContext.SaveChangesAsync(cancellationToken);

        if (session.Attempts > _securitySettings.TwoFactorAttempts)
            throw new BadRequestException(ErrorMessages.TooManyAttempts);

        bool isValid;
        if (session.Provider == TokenOptions.DefaultEmailProvider)
        {
            isValid = await _userManager.VerifyTwoFactorTokenAsync(user, session.Provider, request.Code);
        }
        else
        {
            string? key = await _userManager.GetAuthenticatorKeyAsync(user);
            if (string.IsNullOrEmpty(key))
                throw new BadRequestException(ErrorMessages.AuthenticatorNotConfigured);

            byte[] secretBytes = Base32Encoding.ToBytes(key);
            var totp = new Totp(secretBytes);

            isValid = totp.VerifyTotp(request.Code, out long timeStepMatched, new VerificationWindow(0, 0));
        }

        if (!isValid)
            throw new BadRequestException(ErrorMessages.InvalidCode);

        session.Used = true;
        await _nexusDbContext.SaveChangesAsync(cancellationToken);

        var tokens = await GenerateTokensAndUpdateUser(user, ipAddress);
        return new TokenResponse(false, "NA", tokens.Token, tokens.RefreshToken, tokens.RefreshTokenExpiryTime);
    }

    private async Task<TokenResponse> GenerateTokensAndUpdateUser(ApplicationUser user, string ipAddress)
    {
        string token = GenerateJwt(user, ipAddress);

        user.RefreshToken = GenerateRefreshToken();
        user.RefreshTokenExpiryTime = DateTimeOffset.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationInDays);

        await _userManager.UpdateAsync(user);

        return new TokenResponse(RequiresTwoFactor: false, TwoFactorSessionId: "NA", Token: token, RefreshToken: user.RefreshToken, RefreshTokenExpiryTime: user.RefreshTokenExpiryTime);
    }

    private string GenerateJwt(ApplicationUser user, string ipAddress) =>
        GenerateEncryptedToken(GetSigningCredentials(), GetClaims(user, ipAddress));

    private IEnumerable<Claim> GetClaims(ApplicationUser user, string ipAddress) =>
        new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email!),
            new(SystemClaims.Fullname, $"{user.FirstName} {user.LastName}"),
            new(ClaimTypes.Name, user.FirstName ?? string.Empty),
            new(ClaimTypes.Surname, user.LastName ?? string.Empty),
            new(SystemClaims.IpAddress, ipAddress),
            new(SystemClaims.Tenant, user.FKTenantId.ToString()),
            new(SystemClaims.TenantUniqueId, user.Tenant.UniqueId.ToString()),
            //new(SystemClaims.ImageUrl, user.ImageUrl ?? string.Empty),
            //new(ClaimTypes.MobilePhone, user.PhoneNumber ?? string.Empty)
        };

    private static string GenerateRefreshToken()
    {
        byte[] randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private string GenerateEncryptedToken(SigningCredentials signingCredentials, IEnumerable<Claim> claims)
    {
        var token = new JwtSecurityToken(
           claims: claims,
           expires: DateTimeOffset.UtcNow.AddMinutes(_jwtSettings.TokenExpirationInMinutes).UtcDateTime,
           signingCredentials: signingCredentials);
        var tokenHandler = new JwtSecurityTokenHandler();
        return tokenHandler.WriteToken(token);
    }

    private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key)),
            ValidateIssuer = false,
            ValidateAudience = false,
            RoleClaimType = ClaimTypes.Role,
            ClockSkew = TimeSpan.Zero,
            ValidateLifetime = false
        };
        var tokenHandler = new JwtSecurityTokenHandler();
        var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);
        if (securityToken is not JwtSecurityToken jwtSecurityToken ||
            !jwtSecurityToken.Header.Alg.Equals(
                SecurityAlgorithms.HmacSha256,
                StringComparison.InvariantCultureIgnoreCase))
        {
            throw new UnauthorizedException(ErrorMessages.AuthenticationInvalidToken);
        }

        return principal;
    }

    private SigningCredentials GetSigningCredentials()
    {
        byte[] secret = Encoding.UTF8.GetBytes(_jwtSettings.Key);
        return new SigningCredentials(new SymmetricSecurityKey(secret), SecurityAlgorithms.HmacSha256);
    }

    public async Task RequestTwoFactorEmailCodeAsync(string sessionId, CancellationToken cancellationToken)
    {
        const int RESEND_INTERVAL = 30;
        var sessionGuid = Guid.Parse(sessionId);
        var session = await _nexusDbContext.ApplicationUserTwoFactorSession.Include(x => x.ApplicationUsers)
            .FirstOrDefaultAsync(x => x.SessionId == sessionGuid && x.Used == false, cancellationToken);

        if (session is null || session.ExpiresAtUtc < _dateTimeService.UtcNow)
            throw new BadRequestException(ErrorMessages.TwoFactorAuthenticationSessionExpired);

        if (session.Attempts > _securitySettings.TwoFactorAttempts)
            throw new BadRequestException(ErrorMessages.TooManyAttempts);

        DateTimeOffset lastActionTime = session.LastModifiedOn ?? session.CreatedOn;

        double secondsSinceLastSend = (_dateTimeService.UtcNow - lastActionTime).TotalSeconds;

        if (secondsSinceLastSend < RESEND_INTERVAL)
        {
            int remaining = RESEND_INTERVAL - (int)secondsSinceLastSend;
            throw new BadRequestException(string.Format(ErrorMessages.RemainingFewSeconds, remaining));
        }

        var user = await _userManager.FindByIdAsync(session.FKApplicationUserPKId);
        user.UserTwoFactorAuthenticationType = Domain.Enums.Nexus.UserTwoFactorAuthenticationTypes.Email;
        session.Provider = TokenOptions.DefaultEmailProvider;
        session.Attempts += 1;
        await _nexusDbContext.SaveChangesAsync(cancellationToken);

        string code = await _userManager.GenerateTwoFactorTokenAsync(user, session.Provider);
        _jobService.Enqueue(() => _mailService.TwoFactorVerificationEmailAsync(user.Id, code, CancellationToken.None));
    }
}