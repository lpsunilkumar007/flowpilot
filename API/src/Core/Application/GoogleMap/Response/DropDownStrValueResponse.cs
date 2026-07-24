using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.GoogleMap.Response;

public class DropDownStrValueResponse
{
    [Required]
    public required string Value { get; set; }
    [Required]
    public required string Text { get; set; }
    public bool IsSelected { get; set; }

}
