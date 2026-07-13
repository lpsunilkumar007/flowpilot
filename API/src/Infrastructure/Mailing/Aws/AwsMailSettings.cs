namespace FlowPilot.Infrastructure.Mailing.Aws;
public class AwsMailSettings
{
    public required string EmailHost { get; set; }
    public required string SendEmailPort { get; set; }
    public required bool SendEmailEnableSsl { get; set; }
    public required string AWSUsername { get; set; }
    public required string AWSPassword { get; set; }
    public required bool IsTestModeEnabled { get; set; }
    public List<string> TestModeEmailTo { get; set; } = new();
    public List<string> TestModeEmailCc { get; set; } = new();
    public List<string> TestModeEmailBCc { get; set; } = new();
}
