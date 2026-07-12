namespace FlowPilot.Application.Nexus.Identity.Tokens.Models.Response;

// public record TokenResponse(string Token, string RefreshToken, DateTimeOffset RefreshTokenExpiryTime);

public record TokenResponse(bool RequiresTwoFactor, string TwoFactorSessionId, string Token, string RefreshToken, DateTimeOffset RefreshTokenExpiryTime);