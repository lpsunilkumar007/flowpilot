using FlowPilot.Application.Nexus.Identity.Users.Models.Response;

namespace FlowPilot.Application.Nexus.Identity.Users.Models.Request;
public class UserRolesRequest
{
    public List<UserRoleResponse> UserRoles { get; set; } = new();
}
