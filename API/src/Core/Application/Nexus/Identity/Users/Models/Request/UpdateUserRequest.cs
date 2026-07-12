using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.Nexus;

namespace FlowPilot.Application.Nexus.Identity.Users.Models.Request;
public class UpdateUserRequest
{
    public string Id { get; set; } = default!;

    [Required]
    public required string FirstName { get; set; }

    [Required]
    public required string LastName { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Email { get; set; }

    public FileUploadRequest? Image { get; set; }

    public bool DeleteCurrentImage { get; set; }

    [Required]
    public required string TimeZone { get; set; }
}

public class UpdateTwoFactorAuthenticationDetailsRequest
{
    [Required]
    public required bool IsTwoFactorAuthenticationEnabled { get; set; }

    [Required]
    public required UserTwoFactorAuthenticationTypes UserTwoFactorAuthenticationType { get; set; }
}