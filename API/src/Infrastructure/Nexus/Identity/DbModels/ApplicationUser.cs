using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using FlowPilot.Domain.Enums.Nexus;
using FlowPilot.Infrastructure.Nexus.MultiTenant.DbModels;
using Microsoft.AspNetCore.Identity;

namespace FlowPilot.Infrastructure.Nexus.Identity.DbModels;

public class ApplicationUser : IdentityUser
{
    [Required]
    public required string FirstName { get; set; }

    [Required]
    public required string LastName { get; set; }
    public string? ImageUrl { get; set; }

    [Required]
    public bool IsActive { get; set; }

    public string? RefreshToken { get; set; }
    public DateTimeOffset RefreshTokenExpiryTime { get; set; }
    public string? ObjectId { get; set; }

    [Required]
    [ForeignKey(nameof(Tenant))]
    public int FKTenantId { get; set; }
    public virtual Tenants Tenant { get; set; }

    [Required]
    public required string TimeZone { get; set; }

    public required Domain.Enums.Nexus.UserRegistrationType UserRegistrationType { get; set; }

    public required UserTwoFactorAuthenticationTypes UserTwoFactorAuthenticationType { get; set; }

    public string? FacebookJson { get; set; }

    public string? GoogleJson { get; set; }
}
