using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Nexus.Identity.Users.Models.Request;
using FlowPilot.Application.Nexus.Identity.Users.Models.Response;
using FlowPilot.Infrastructure.Nexus.Identity.DbModels;
using FlowPilot.Infrastructure.SystemConstants;
using FlowPilot.Shared.Authorization;
using FlowPilot.Shared.Nexus;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Nexus.Identity;

internal partial class UserService
{
    public async Task AssignDefaultRoleToNewTenantAsync(int tenantId, Guid uniqueId, CancellationToken cancellationToken)
    {
        await MigrateLegacyBasicRoleAsync(tenantId, cancellationToken);

        foreach (string roleName in SystemRoles.DefaultRoles)
        {
            var role = await EnsureDefaultRoleExistsAsync(tenantId, roleName, cancellationToken);
            bool hasPermissionClaims = await _nexusDbContext.RoleClaims
                .AnyAsync(c => c.RoleId == role.Id && c.ClaimType == SystemClaims.Permission, cancellationToken);
            if (!hasPermissionClaims)
            {
                await SyncPermissionsToTenantRoleAsync(GetPermissionsForDefaultRole(roleName, uniqueId), role, cancellationToken);
            }
        }

    }

    private static IReadOnlyList<SystemPermission> GetPermissionsForDefaultRole(string roleName, Guid tenantUniqueId)
    {
        if (roleName == SystemRoles.Admin)
        {
            if (tenantUniqueId == NexusConstants.Root.TenantUniqueId)
            {
                return SystemPermissions.Admin
                    .Concat(SystemPermissions.Root)
                    .GroupBy(p => p.Name)
                    .Select(g => g.First())
                    .ToList();
            }

            return SystemPermissions.Admin;
        }

        if (roleName == SystemRoles.SalesManager)
        {
            return SystemPermissions.SalesManager;
        }

        return SystemPermissions.SalesRepresentative;
    }

    private async Task<ApplicationRole> EnsureDefaultRoleExistsAsync(int tenantId, string roleName, CancellationToken cancellationToken)
    {
        string tenantRoleName = SystemRoles.FormatTenantRoleName(roleName, tenantId);

        if (await _roleManager.Roles.SingleOrDefaultAsync(r => r.Name == tenantRoleName && r.FKTenantPKId == tenantId, cancellationToken)
            is ApplicationRole role)
        {
            role.UserFriendlyRoleName = roleName;
            role.Description = SystemRoles.GetFriendlyDescription(roleName);
            await _roleManager.UpdateAsync(role);
            return role;
        }

        role = new ApplicationRole
        {
            UserFriendlyRoleName = roleName,
            Name = tenantRoleName,
            NormalizedName = tenantRoleName.ToUpperInvariant(),
            FKTenantPKId = tenantId,
            Description = SystemRoles.GetFriendlyDescription(roleName)
        };
        await _roleManager.CreateAsync(role);
        return role;
    }

    private async Task MigrateLegacyBasicRoleAsync(int tenantId, CancellationToken cancellationToken)
    {
        string legacyName = SystemRoles.FormatTenantRoleName(SystemRoles.Basic, tenantId);
        string newName = SystemRoles.FormatTenantRoleName(SystemRoles.SalesRepresentative, tenantId);

        var legacyRole = await _roleManager.Roles
            .SingleOrDefaultAsync(r => r.Name == legacyName && r.FKTenantPKId == tenantId, cancellationToken);

        if (legacyRole is null)
        {
            return;
        }

        var existingRep = await _roleManager.Roles
            .SingleOrDefaultAsync(r => r.Name == newName && r.FKTenantPKId == tenantId, cancellationToken);

        if (existingRep is null)
        {
            legacyRole.Name = newName;
            legacyRole.NormalizedName = newName.ToUpperInvariant();
            legacyRole.UserFriendlyRoleName = SystemRoles.SalesRepresentative;
            legacyRole.Description = SystemRoles.GetFriendlyDescription(SystemRoles.SalesRepresentative);
            await _roleManager.UpdateAsync(legacyRole);
            return;
        }

        // Move users from Basic to SalesRepresentative, then delete Basic.
        var usersInLegacy = await _userManager.GetUsersInRoleAsync(legacyName);
        foreach (var user in usersInLegacy)
        {
            if (!await _userManager.IsInRoleAsync(user, newName))
            {
                await _userManager.AddToRoleAsync(user, newName);
            }

            await _userManager.RemoveFromRoleAsync(user, legacyName);
        }

        await _roleManager.DeleteAsync(legacyRole);
    }

    private async Task SyncPermissionsToTenantRoleAsync(IReadOnlyList<SystemPermission> permissions, ApplicationRole role, CancellationToken cancellationToken)
    {
        var desired = permissions.Select(p => p.Name).ToHashSet(StringComparer.Ordinal);
        var currentClaims = await _roleManager.GetClaimsAsync(role);

        foreach (var claim in currentClaims.Where(c => c.Type == SystemClaims.Permission && !desired.Contains(c.Value)))
        {
            await _roleManager.RemoveClaimAsync(role, claim);
        }

        currentClaims = await _roleManager.GetClaimsAsync(role);
        foreach (string permissionName in desired)
        {
            if (!currentClaims.Any(c => c.Type == SystemClaims.Permission && c.Value == permissionName))
            {
                _nexusDbContext.RoleClaims.Add(new ApplicationRoleClaim
                {
                    RoleId = role.Id,
                    ClaimType = SystemClaims.Permission,
                    ClaimValue = permissionName,
                });
            }
        }

        await _nexusDbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<UserRoleResponse>> GetRolesAsync(string userId, CancellationToken cancellationToken)
    {
        var userRoles = new List<UserRoleResponse>();

        var user = await _userManager.Users.SingleOrDefaultAsync(x => x.Id == userId && x.FKTenantId == _currentUser.GetTenant());
        if (user is null) throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "User"));
        var roles = await _roleManager.Roles.Where(x => x.FKTenantPKId == user.FKTenantId).AsNoTracking().ToListAsync(cancellationToken);
        if (roles is null) throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Roles"));
        foreach (var role in roles)
        {
            userRoles.Add(new UserRoleResponse
            {
                RoleId = role.Id,
                RoleName = role.UserFriendlyRoleName,
                Description = role.Description,
                Enabled = await _userManager.IsInRoleAsync(user, role.Name!)
            });
        }

        return userRoles;
    }

    public async Task<string> AssignRolesAsync(string userId, UserRolesRequest request, CancellationToken cancellationToken)
    {
        var user = await _userManager.Users.Where(u => u.Id == userId && u.FKTenantId == _currentUser.GetTenant()).FirstOrDefaultAsync(cancellationToken);

        _ = user ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "User"));

        // Check if the user is an admin for which the admin role is getting disabled
        var tenantDetails = await _tenantService.GetByIdAsync(_currentUser.GetTenant(), cancellationToken);
        if (await _userManager.IsInRoleAsync(user, SystemRoles.FormatTenantRoleName(SystemRoles.Admin, tenantDetails.Id))
            //&& request.UserRoles.Any(a => !a.Enabled && a.RoleName == WorkPowerRoles.Admin)
            )
        {
            // Get count of users in Admin Role
            int adminCount = (await _userManager.GetUsersInRoleAsync(SystemRoles.FormatTenantRoleName(SystemRoles.Admin, tenantDetails.Id))).Count;

            // Check if user is not Root Tenant Admin
            if (user.Id == NexusConstants.Root.UserId)
            {
                if (tenantDetails.UniqueId == NexusConstants.Root.TenantUniqueId)
                {
                    throw new ConflictException(ErrorMessages.RootTenantRoleCannotBeRemoved);
                }
            }
            else if (adminCount < 2)
            {
                throw new ConflictException(ErrorMessages.MinimumAdminMessage);
            }
        }

        foreach (var userRole in request.UserRoles)
        {
            // Check if Role Exists
            string roleName = SystemRoles.FormatTenantRoleName(userRole.RoleName!, tenantDetails.Id);
            if (await _roleManager.FindByNameAsync(roleName) is not null)
            {
                if (userRole.Enabled)
                {
                    if (!await _userManager.IsInRoleAsync(user, roleName))
                    {
                        await _userManager.AddToRoleAsync(user, roleName);
                    }
                }
                else
                {
                    await _userManager.RemoveFromRoleAsync(user, roleName);
                }
            }
        }

        await ResetUserPermissionAsync(userId, new CancellationToken(), false);

        return SuccessMessages.UserRoleAssigned;
    }
}
