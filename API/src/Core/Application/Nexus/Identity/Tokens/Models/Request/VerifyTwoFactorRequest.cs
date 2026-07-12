namespace FlowPilot.Application.Nexus.Identity.Tokens.Models.Request;
public record VerifyTwoFactorRequest(string TwoFactorSessionId, string Code);