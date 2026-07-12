using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Nexus.Identity.Users.Models.Request;
public class UpdateUserDetailsRequest
{
    public bool IsActive { get; set; }
    public string? UserId { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string FirstName { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string LastName { get; set; }

    public string? PhoneNumber { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string TimeZone { get; set; }
}

