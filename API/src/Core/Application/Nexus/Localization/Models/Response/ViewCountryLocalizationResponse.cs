using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.Nexus.Localization.Models.Response;
public class ViewCountryLocalizationResponse
{
    [Required]
    public DefaultIdType Id { get; set; }

    [Required]
    public DefaultIdType FKCountryId { get; set; }

    [Required]
    public required string Key { get; set; }

    [Required]
    public required string Value { get; set; }

}
