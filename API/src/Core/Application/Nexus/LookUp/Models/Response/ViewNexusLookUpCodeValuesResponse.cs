using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.Nexus.LookUp.Models.Response;
public class ViewNexusLookUpCodeValuesResponse
{
    [Required]
    public DefaultIdType Id { get; set; }
    [Required]
    public required string LookUpValue { get; set; }
    [Required]

    public required int DisplayOrder { get; set; }
    [Required]
    public required bool IsActive { get; set; }

    [Required]
    public required bool IsDefault { get; set; }
}