namespace FlowPilot.Application.Nexus.Identity.Tokens.Models.Request;
public record RefreshTokenRequest(string Token, string RefreshToken);