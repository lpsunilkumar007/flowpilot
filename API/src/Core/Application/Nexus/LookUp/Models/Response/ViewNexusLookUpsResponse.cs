using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.Nexus;

namespace FlowPilot.Application.Nexus.LookUp.Models.Response;
public class ViewNexusLookUpsResponse
{
    [Required]
    public DefaultIdType Id { get; set; }
    [Required]
    public required NexusLookUpCodeTypes LookUpCodeType { get; set; }
    public string? Description { get; set; }
}
