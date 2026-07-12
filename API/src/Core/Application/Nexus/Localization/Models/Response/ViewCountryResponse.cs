using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.Nexus.Localization.Models.Response;
public class ViewCountryResponse
{
    [Required]
    public required DefaultIdType Id { get; set; }

    [Required]
    public required string CountryName { get; set; }

    [Required]
    public required string CountryCode { get; set; }

    [Required]
    public required int DisplayOrder { get; set; }
}
