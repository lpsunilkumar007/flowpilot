namespace FlowPilot.Infrastructure.FileStorage;
public class AmazonS3Settings
{
    public string DefaultBucketName { get; set; } = default!;
    public string AwsAccessKeyId { get; set; } = default!;
    public string AwsSecretAccessKey { get; set; } = default!;

    public string Region { get; set; } = "us-west-2"; // e.g. "eu-west-2"
    public string? PublicBaseUrl { get; set; }
    public bool UsePresignedUrls { get; set; } = false;
}
