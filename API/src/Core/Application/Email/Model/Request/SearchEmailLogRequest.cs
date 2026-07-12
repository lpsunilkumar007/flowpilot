using FlowPilot.Application.Common.Models;

namespace FlowPilot.Application.Email.Model.Request;
public class SearchEmailLogRequest : SearchRequestBaseClass
{
    public string? To { get; set; }
    public string? Subject { get; set; }
    public bool? SentStatus { get; set; }

    public string? From { get; set; }
    public DateTimeOffset? SendDateTimeOffset { get; set; }
}
