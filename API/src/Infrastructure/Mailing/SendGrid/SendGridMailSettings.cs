namespace FlowPilot.Infrastructure.Mailing.SendGrid;
public class SendGridMailSettings
{
    public required string APIKey { get; set; }
    public required string FromEmail { get; set; }
    public required bool IsTestModeEnabled { get; set; }
    public List<string> TestModeEmailTo { get; set; } = new();
    public List<string> TestModeEmailCc { get; set; } = new();
    public List<string> TestModeEmailBCc { get; set; } = new();
}
