using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.Nexus.MultiTenant.Models.Response;
public class ViewTenantResponse
{
    [Required]
    public required string Name { get; set; }

    [Required]
    public required string AdminEmail { get; set; }

    [Required]
    public required bool IsActive { get; set; }

    public string? StripeCustomerId { get; set; }

    [Required]
    public required DateTimeOffset CreatedOn { get; set; }
    [Required]
    public required DefaultIdType Id { get; set; }
}
