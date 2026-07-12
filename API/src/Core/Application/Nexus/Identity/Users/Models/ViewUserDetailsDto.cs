using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.Nexus.Identity.Users.Models;
public class ViewUserDetailsDto
{
    public required Guid Id { get; set; }

    public string? UserName { get; set; }

    public  required string FirstName { get; set; }

    public required string LastName { get; set; }

    public required string Email { get; set; }

    public required bool IsActive { get; set; }

    public required bool EmailConfirmed { get; set; }

    public string? PhoneNumber { get; set; }

    public string? ImageUrl { get; set; }

    [Required]
    public required string TimeZone { get; set; }
}
