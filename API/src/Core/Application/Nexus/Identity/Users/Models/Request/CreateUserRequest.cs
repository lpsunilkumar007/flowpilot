using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Nexus.Identity.Users.Models.Request;
public class CreateUserRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string FirstName { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string LastName { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string Email { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string Password { get; set; }

    [Display(Name = "Confirm Password")]
    [Compare(nameof(Password))]
    [Required]
    public required string ConfirmPassword { get; set; }
    public string? PhoneNumber { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string TimeZone { get; set; }

    public string? ReportsToUserId { get; set; }
}
