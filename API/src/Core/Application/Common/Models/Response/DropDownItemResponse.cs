using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.Common.Models.Response;
public class DropDownItemResponse
{
    [Required]
    public required int Value { get; set; }

    [Required]
    public required string Text { get; set; }

    public string? StrValue { get; set; }
}


public class UserDropDownItemResponse
{
    public required string Text { get; set; }

    public string? StrValue { get; set; }

    public string? TimeZone { get; set; }
}
