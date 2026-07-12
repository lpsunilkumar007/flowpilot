using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.Nexus.MultiTenant.Models.Request;
public class UpdateTenantRequest
{
    [Required]
    public required string Name { get; set; }

    [Required]
    public required string AdminEmail { get; set; }

    [Required]
    public required bool IsActive { get; set; }
   
    [Required]
    public required DefaultIdType Id { get; set; }
}
