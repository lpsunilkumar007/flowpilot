namespace FlowPilot.Infrastructure.Auth;

public class SecuritySettings
{
    public string? Provider { get; set; }

    public bool RequireConfirmedAccount { get; set; }

    public bool RequiresTwoFactorAuthentication { get; set; }

    public int TwoFactorSessionValidForMin { get; set; } = 10;

    public int TwoFactorAttempts { get; set; } = 5;
}
