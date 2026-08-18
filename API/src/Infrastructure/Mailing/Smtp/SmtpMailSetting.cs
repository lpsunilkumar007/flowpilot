namespace FlowPilot.Infrastructure.Mailing.Smtp;
public class SmtpMailSetting
{
    public required string DisplayName { get; set; }
    public required string From { get; set; }
    public required string Host { get; set; }
    public required string Password { get; set; }
    public required int Port { get; set; }
    public required string UserName { get; set; }
    public required bool IsTestModeEnabled { get; set; }
    public List<string> TestModeEmailTo { get; set; } = new();
    public List<string> TestModeEmailCc { get; set; } = new();
    public List<string> TestModeEmailBCc { get; set; } = new();
}
