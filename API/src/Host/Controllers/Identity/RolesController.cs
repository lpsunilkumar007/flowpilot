using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Application.Nexus.Identity.Roles;
using FlowPilot.Application.Nexus.Identity.Roles.Models;
using FlowPilot.Application.Nexus.Identity.Roles.Models.Request;
using FlowPilot.Host.Controllers.BaseControllers;

namespace FlowPilot.Host.Controllers.Identity;

public class RolesController : VersionNeutralApiController
{
    private readonly IRoleService _roleService;
    private readonly ICurrentUser _currentUser;

    public RolesController(IRoleService roleService, ICurrentUser currentUser)
    {
        _roleService = roleService;
        _currentUser = currentUser;
    }

    [HttpGet]
    [RequireAnyResource(SystemAction.View, [SystemResource.Roles, SystemResource.Users])]
    [OpenApiOperation("Get a list of all roles.", "")]
    public Task<List<RoleDto>> GetListAsync(CancellationToken cancellationToken)
    {
        return _roleService.GetListAsync(cancellationToken);
    }

    [HttpGet("get-all")]
    [MustHavePermission(SystemAction.View, SystemResource.Roles)]
    [OpenApiOperation("Get a list of all roles permissions.", "")]
    public IReadOnlyList<SystemPermission> GetAllPermissionList(CancellationToken cancellationToken)
    {
        if (_currentUser.GetTenantUniqueId() == Shared.Nexus.NexusConstants.Root.TenantUniqueId)
        {
            return SystemPermissions.All;
        }

        return SystemPermissions.Admin;
    }

    [HttpGet("{id}")]
    [MustHavePermission(SystemAction.View, SystemResource.Roles)]
    [OpenApiOperation("Get role details.", "")]
    public Task<RoleDto> GetByIdAsync(string id)
    {
        return _roleService.GetByIdAsync(id);
    }

    [HttpGet("{id}/permissions")]
    [MustHavePermission(SystemAction.View, SystemResource.Roles)]
    [OpenApiOperation("Get role details with its permissions.", "")]
    public Task<RoleDto> GetByIdWithPermissionsAsync(string id, CancellationToken cancellationToken)
    {
        return _roleService.GetByIdWithPermissionsAsync(id, cancellationToken);
    }

    [HttpPut("{id}/permissions")]
    [MustHavePermission(SystemAction.Update, SystemResource.Roles)]
    [OpenApiOperation("Update a role's permissions.", "")]
    public async Task<ActionResult<string>> UpdatePermissionsAsync(string id, UpdateRolePermissionsRequest request, CancellationToken cancellationToken)
    {
        if (id != request.RoleId)
        {
            return BadRequest();
        }

        return Ok(await _roleService.UpdatePermissionsAsync(request, cancellationToken));
    }

    [HttpPost]
    [RequireAnyAction([SystemAction.Create, SystemAction.Update], SystemResource.Roles)]
    [OpenApiOperation("Create or update a role.", "")]
    public Task<string> RegisterRoleAsync(CreateOrUpdateRoleRequest request)
    {
        return _roleService.CreateOrUpdateAsync(request);
    }

    [HttpDelete("{id}")]
    [MustHavePermission(SystemAction.Delete, SystemResource.Roles)]
    [OpenApiOperation("Delete a role.", "")]
    public Task<string> DeleteAsync(string id)
    {
        return _roleService.DeleteAsync(id);
    }
}