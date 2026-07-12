using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.Nexus.Localization.Models.Response;
public class CreateCountryLocalizationResponse
{
    [Required]
    public required DefaultIdType Id { get; set; }

    [Required]
    public required string Message { get; set; }
}
