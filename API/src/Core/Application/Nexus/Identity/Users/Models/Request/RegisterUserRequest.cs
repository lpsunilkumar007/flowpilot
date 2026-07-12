using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.Nexus.Identity.Users.Models.Request;
public class RegisterUserRequest
{
    [Required]
    public required string FirstName { get; set; }

    [Required]
    public required string LastName { get; set; }

    [Required]
    public required string Email { get; set; }

    [Required]
    public required string Password { get; set; }

    [Display(Name = "Confirm Password")]
    [Compare(nameof(Password))]
    [Required]
    public required string ConfirmPassword { get; set; }
    public string? PhoneNumber { get; set; }
    public string? TimeZone { get; set; }

    [Required(ErrorMessage = "You must accept the terms and conditions.")]
    [Range(typeof(bool), "true", "true", ErrorMessage = "You must accept the terms and conditions.")]
    public bool IsTermsAndConditionsAccepted { get; set; }

}

public class RegisterUserSocialMedialRequestDto
{
    public string? FacebookJson { get; set; }
    public string? GoogleJson { get; set; }
}
