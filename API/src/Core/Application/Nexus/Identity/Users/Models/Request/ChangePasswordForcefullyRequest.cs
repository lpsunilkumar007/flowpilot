using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Nexus.Identity.Users.Models.Request;
public class ChangePasswordForcefullyRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public string NewPassword { get; set; } = default!;

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [Display(Name = "Confirm Password")]
    [Compare(nameof(NewPassword))]
    public string ConfirmNewPassword { get; set; } = default!;
}
