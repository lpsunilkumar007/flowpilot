using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.Nexus;

namespace FlowPilot.Application.Nexus.Identity.Users.Models.Response;

public class ViewUserDetailsResponse
{
    public Guid Id { get; set; }

    public required string UserName { get; set; }

    public required string FirstName { get; set; }

    public required string LastName { get; set; }

    public required string Email { get; set; }

    public required bool IsActive { get; set; }

    public required bool EmailConfirmed { get; set; }

    public string? PhoneNumber { get; set; }

    public string? ImageUrl { get; set; }

    [Required]
    public required string TimeZone { get; set; }

    public bool? IsTwoFactorAuthenticationEnabled { get; set; }
}

public class ViewUserTwoFactorAuthenticationDetailsResponse
{
    [Required]
    public required bool IsTwoFactorAuthenticationEnabled { get; set; }

    [Required]
    public required UserTwoFactorAuthenticationTypes UserTwoFactorAuthenticationType  { get; set; }

}
