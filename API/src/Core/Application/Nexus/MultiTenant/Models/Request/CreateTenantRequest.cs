using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.Nexus.MultiTenant.Models.Request;
public class CreateTenantRequest
{
    public required Guid UniqueId { get; set; }

    [Required]
    public required string Name { get; set; }

    [Required]
    public required string AdminEmail { get; set; }
    public string? ConnectionString { get; set; }

    [Required]
    public required bool IsActive { get; set; }
}
