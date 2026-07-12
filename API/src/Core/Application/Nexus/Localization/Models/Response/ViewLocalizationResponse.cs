using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.Nexus.Localization.Models.Response;
public class ViewLocalizationResponse
{
    [Required]
    public required string Key { get; set; }

    [Required]
    public required string Value { get; set; }
}
