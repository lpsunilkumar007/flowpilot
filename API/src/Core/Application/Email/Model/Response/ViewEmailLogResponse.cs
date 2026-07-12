namespace FlowPilot.Application.Email.Model.Response;
public class ViewEmailLogResponse
{
    public required int Id { get; set; }
    public List<string>? To { get; set; }
    public string? Subject { get; set; }
    public bool? IsEmailSent { get; set; }
    public DateTimeOffset CreatedOn { get; set; }
    public string? From { get; set; }
}
