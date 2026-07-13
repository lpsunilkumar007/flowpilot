using FlowPilot.Domain.Common.Contracts;
using FlowPilot.Infrastructure.Nexus.Identity.DbModels;
using FlowPilot.Infrastructure.Nexus.Subscription.DbModels;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlowPilot.Infrastructure.Nexus.MultiTenant.DbModels;
public class Tenants : AuditableEntity
{
    [Required]
    public required Guid UniqueId { get; set; }

    [Required]
    public required string Name { get; set; }

    [Required]
    public required string AdminEmail { get; set; }

    public string? ConnectionString { get; set; }

    [Required]
    public bool IsActive { get; set; }

    public string? StripeCustomerId { get; set; }

    public virtual List<ApplicationUser> ApplicationUsers { get; set; }
}