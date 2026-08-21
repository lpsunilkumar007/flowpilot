using System.Data;
using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Application.Nexus.Identity.Roles;
using FlowPilot.Application.Nexus.Identity.Roles.Models;
using FlowPilot.Application.Nexus.Identity.Roles.Models.Request;
using FlowPilot.Application.Nexus.Identity.Users;
using FlowPilot.Infrastructure.Nexus.Identity.DbModels;
using FlowPilot.Infrastructure.Nexus.Identity.Extensions;
using FlowPilot.Infrastructure.Persistence.Context.Nexus;
using FlowPilot.Infrastructure.SystemConstants;
using FlowPilot.Shared.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Nexus.Identity;

internal class RoleService : IRoleService
{
    private readonly ICurrentUser _currentUser;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly NexusDbContext _nexusDbContext;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IUserService _userService;

    public RoleService(ICurrentUser currentUser, RoleManager<ApplicationRole> roleManager, NexusDbContext nexusDbContext, UserManager<ApplicationUser> userManager, IUserService userService)
    {
        _currentUser = currentUser;
        _roleManager = roleManager;
        _nexusDbContext = nexusDbContext;
        _userManager = userManager;
        _userService = userService;
    }

    public async Task<string> CreateOrUpdateAsync(CreateOrUpdateRoleRequest request)
    {
        if (string.IsNullOrEmpty(request.Id))
        {
            if (await _nexusDbContext.Roles.AnyAsync(x => x.UserFriendlyRoleName == request.Name && x.FKTenantPKId == _currentUser.GetTenant()))
            {
                throw new ConflictException(string.Format(ErrorMessages.AlreadyExists, request.Name));
            }

            string tenantRoleName = SystemRoles.FormatTenantRoleName(request.Name, _currentUser.GetTenant());

            var role = new ApplicationRole
            {
                UserFriendlyRoleName = request.Name,
                Description = request.Description,
                FKTenantPKId = _currentUser.GetTenant(),
                Name = tenantRoleName,
                NormalizedName = tenantRoleName.ToUpperInvariant()
            };
            var result = await _roleManager.CreateAsync(role);

            if (!result.Succeeded)
            {
                throw new BadRequestException(ErrorMessages.CreateRoleFailed, result.GetErrors());
            }

            return string.Format(SuccessMessages.RoleCreated, request.Name);
        }
        else
        {
            // Update an existing role.
            var role = await _nexusDbContext.Roles.SingleOrDefaultAsync(x => x.Id == request.Id && x.FKTenantPKId == _currentUser.GetTenant());

            _ = role ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Role"));

            if (await _nexusDbContext.Roles.AnyAsync(x => x.UserFriendlyRoleName == request.Name && x.Id != request.Id && x.FKTenantPKId == _currentUser.GetTenant()))
            {
                throw new ConflictException(string.Format(ErrorMessages.AlreadyExists, request.Name));
            }

            if (SystemRoles.IsDefaultForTenant(role.Name!))
            {
                throw new ConflictException(string.Format(ErrorMessages.AlreadyExists, role.UserFriendlyRoleName));
            }

            role.UserFriendlyRoleName = request.Name;
            role.Description = request.Description;
            var result = await _roleManager.UpdateAsync(role);

            if (!result.Succeeded)
            {
                throw new BadRequestException(ErrorMessages.UpdateRoleFailed, result.GetErrors());
            }

            // await _userService.ResetUserPermissionAsync(_currentUser.GetUserId().ToString(), new CancellationToken(), true);

            return string.Format(SuccessMessages.RoleUpdated, role.UserFriendlyRoleName);
        }
    }

    public async Task<string> DeleteAsync(string id)
    {
        var role = await _nexusDbContext.Roles.SingleOrDefaultAsync(x => x.Id == id && x.FKTenantPKId == _currentUser.GetTenant());

        _ = role ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Role"));

        if (SystemRoles.IsDefaultForTenant(role.Name!))
        {
            throw new ConflictException(string.Format(ErrorMessages.CantDeleteRole, role.Name));
        }

        if ((await _userManager.GetUsersInRoleAsync(role.Name!)).Count > 0)
        {
            throw new ConflictException(string.Format(ErrorMessages.NotAllowedToDeleteRole, role.Name));
        }

        await _roleManager.DeleteAsync(role);

        return string.Format(SuccessMessages.RoleDeleted, role.UserFriendlyRoleName);
    }

    public Task<bool> ExistsAsync(string roleName, string? excludeId)
    {
        return _nexusDbContext.Roles.AnyAsync(x => x.UserFriendlyRoleName == roleName && x.Id != excludeId && x.FKTenantPKId == _currentUser.GetTenant());
    }

    public async Task<RoleDto> GetByIdAsync(string id)
    {
        var item = await _nexusDbContext.Roles.SingleOrDefaultAsync(x => x.Id == id && x.FKTenantPKId == _currentUser.GetTenant());
        _ = item ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Role"));
        return new RoleDto
        {
            Description = item.Description,
            Id = item.Id,
            Name = item.UserFriendlyRoleName
        };
    }

    public async Task<RoleDto> GetByIdWithPermissionsAsync(string roleId, CancellationToken cancellationToken)
    {
        var role = await GetByIdAsync(roleId);

        role.Permissions = await _nexusDbContext.RoleClaims
            .Where(c => c.RoleId == roleId && c.ClaimType == SystemClaims.Permission)
            .Select(c => c.ClaimValue!)
            .ToListAsync(cancellationToken);

        return role;
    }

    public async Task<int> GetCountAsync(CancellationToken cancellationToken) =>
        await _roleManager.Roles.CountAsync(x => x.FKTenantPKId == _currentUser.GetTenant());

    public async Task<List<RoleDto>> GetListAsync(CancellationToken cancellationToken)
    {
        var items = await _roleManager.Roles.Where(x => x.FKTenantPKId == _currentUser.GetTenant()).ToListAsync();
        return items.ConvertAll(x => new RoleDto
        {
            Description = x.Description,
            Id = x.Id,
            Name = x.UserFriendlyRoleName,
        });
    }

    public async Task<string> UpdatePermissionsAsync(UpdateRolePermissionsRequest request, CancellationToken cancellationToken)
    {
        var role = await _nexusDbContext.Roles.SingleOrDefaultAsync(x => x.Id == request.RoleId && x.FKTenantPKId == _currentUser.GetTenant());
        _ = role ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Role"));

        if (SystemRoles.GetRoleNameWithoutTenantName(role.Name) == SystemRoles.Admin)
        {
            throw new ConflictException(ErrorMessages.UpdateCantModifyPermission);
        }

        //if (_currentUser.GetTenantUniqueId() != NexusConstants.Root.TenantUniqueId)
        //{
        //    // Remove Root Permissions if the Role is not created for Root Tenant.
        //    request.Permissions.RemoveAll(u => u.StartsWith("Permissions.Root."));
        //}

        var currentClaims = await _roleManager.GetClaimsAsync(role);

        // Remove permissions that were previously selected
        foreach (var claim in currentClaims.Where(c => !request.Permissions.Any(p => p == c.Value)))
        {
            var removeResult = await _roleManager.RemoveClaimAsync(role, claim);
            if (!removeResult.Succeeded)
            {
                throw new BadRequestException(ErrorMessages.UpdatePermissionsFailed, removeResult.GetErrors());
            }
        }

        // Add all permissions that were not previously selected
        foreach (string permission in request.Permissions.Where(c => !currentClaims.Any(p => p.Value == c)))
        {
            if (!string.IsNullOrEmpty(permission))
            {
                _nexusDbContext.RoleClaims.Add(new ApplicationRoleClaim
                {
                    RoleId = role.Id,
                    ClaimType = SystemClaims.Permission,
                    ClaimValue = permission,
                    CreatedBy = _currentUser.GetUserId().ToString()
                });
                await _nexusDbContext.SaveChangesAsync(cancellationToken);
            }
        }

            await _userService.ResetUserPermissionAsync(string.Empty, new CancellationToken(), true);

            return SuccessMessages.UpdatePermissions;
        }
    }
