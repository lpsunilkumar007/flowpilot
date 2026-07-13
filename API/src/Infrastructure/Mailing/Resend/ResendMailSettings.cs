namespace FlowPilot.Infrastructure.Mailing.Resend;
public class ResendMailSettings
{
    public required string APIKey { get; set; }
    public required string FromEmail { get; set; }
    public required bool IsTestModeEnabled { get; set; }
    public List<string> TestModeEmailTo { get; set; } = new();
    public List<string> TestModeEmailCc { get; set; } = new();
    public List<string> TestModeEmailBCc { get; set; } = new();
}
