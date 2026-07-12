using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.Nexus.Localization.Models.Response;
public class CreateCountryResponse
{
    [Required]
    public required DefaultIdType Id { get; set; }

    [Required]
    public required string Message { get; set; }
}
