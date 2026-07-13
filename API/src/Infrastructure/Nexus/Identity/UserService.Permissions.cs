using FlowPilot.Application.Common.Caching;
using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Infrastructure.SystemConstants;
using FlowPilot.Shared.Authorization;
using Microsoft.EntityFrameworkCore;
namespace FlowPilot.Infrastructure.Nexus.Identity;
internal partial class UserService
{
    public async Task<List<string>> GetPermissionsAsync(string userId, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(userId);

        _ = user ?? throw new BadRequestException(ErrorMessages.AuthenticationFailed);

        var userRoles = await _userManager.GetRolesAsync(user);
        var permissions = new List<string>();
        foreach (var role in await _roleManager.Roles
            .Where(r => userRoles.Contains(r.Name!))
            .ToListAsync(cancellationToken))
        {
            permissions.AddRange(await _nexusDbContext.RoleClaims
                .Where(rc => rc.RoleId == role.Id && rc.ClaimType == SystemClaims.Permission)
                .Select(rc => rc.ClaimValue!)
                .ToListAsync(cancellationToken));
        }

        return permissions.Distinct().ToList();
    }

    public async Task<bool> HasPermissionAsync(string userId, string permission, CancellationToken cancellationToken)
    {
        var permissions = await _cache.GetOrSetAsync(
            _cacheKeys.GetCacheKey(CacheKeys.Permission, userId),
            () => GetPermissionsAsync(userId, cancellationToken),
            cancellationToken: cancellationToken);

        if (permission.Contains(" OR "))
        {
            var reqPermissions = permission.Split(" OR ");
            return reqPermissions.Any(req => permissions?.Contains(req.Trim()) == true);
        }
        if (permission.Contains(" AND "))
        {
            var reqPermissions = permission.Split(" AND ");
            return reqPermissions.All(req => permissions?.Contains(req.Trim()) == true);
        }

        return permissions?.Contains(permission) ?? false;
    }

    public async Task<bool> ResetUserPermissionAsync(string userId, CancellationToken cancellationToken, bool refereshAll)
    {
        if (refereshAll)
        {
            var uses = await _nexusDbContext.Users.Where(x => x.FKTenantId == _currentUser.GetTenant()).Select(x => x.Id).ToListAsync();
            foreach (string user in uses)
            {
                _ = await _cache.GetOrSetAsync(
            _cacheKeys.GetCacheKey(CacheKeys.Permission, user), () => GetPermissionsAsync(user, cancellationToken), cancellationToken: cancellationToken, clearAndRefill: true);
            }
        }

        if (!string.IsNullOrEmpty(userId))
        {
            _ = await _cache.GetOrSetAsync(
                           _cacheKeys.GetCacheKey(CacheKeys.Permission, userId), () => GetPermissionsAsync(userId, cancellationToken), cancellationToken: cancellationToken, clearAndRefill: true);
        }

        return true;

    }

    public async Task<bool> HasPermissionAsync(string userId, string action, string resource, CancellationToken cancellationToken)
    {
        return await HasPermissionAsync(userId, SystemPermission.NameFor(action, resource), cancellationToken);
    }
}
