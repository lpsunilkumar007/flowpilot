using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Nexus.Identity.Roles.Models.Request;
public class CreateOrUpdateRoleRequest
{
    public string? Id { get; set; }
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string Name { get; set; } = default!;
    public string? Description { get; set; }
}
