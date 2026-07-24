using Microsoft.AspNetCore.Authorization;
using FlowPilot.Shared.Authorization;

namespace FlowPilot.Infrastructure.Auth.Permissions;

public class MustHavePermissionAttribute : AuthorizeAttribute
{
    public MustHavePermissionAttribute(string action, string resource) =>
        Policy = SystemPermission.NameFor(action, resource);
}

public class RequireAnyActionAttribute : AuthorizeAttribute
{
    public RequireAnyActionAttribute(string[] actions, string resource)
    {
        var policies = actions.Select(action => SystemPermission.NameFor(action, resource));

        // Join the policies using OR logic
        Policy = string.Join(" OR ", policies);
    }
}

public class RequireAllActionsAttribute : AuthorizeAttribute
{
    public RequireAllActionsAttribute(string[] actions, string resource)
    {
        var policies = actions.Select(action => SystemPermission.NameFor(action, resource));

        // Join the policies using AND logic
        Policy = string.Join(" AND ", policies);
    }
}

public class RequireAnyResourceAttribute : AuthorizeAttribute
{
    public RequireAnyResourceAttribute(string action, string[] resources)
    {
        var policies = resources.Select(resource => SystemPermission.NameFor(action, resource));

        // Join the policies using OR logic
        Policy = string.Join(" OR ", policies);
    }
}

/// <summary>
/// Specifies that the current user must have at least one of the specified permissions
/// to access the decorated resource.
/// </summary>
public class RequireAnyPermissionAttribute : AuthorizeAttribute
{
    public RequireAnyPermissionAttribute(params string[] permissions)
    {
        ArgumentNullException.ThrowIfNull(permissions);

        if (permissions.Length == 0 || permissions.Length % 2 != 0)
            throw new ArgumentException("Provide alternating action and resource pairs.", nameof(permissions));

        Policy = string.Join(" OR ", Enumerable.Range(0, permissions.Length / 2)
                      .Select(i => SystemPermission.NameFor(
                          permissions[i * 2], permissions[i * 2 + 1])));
    }
}

public class RequireAllResourcesAttribute : AuthorizeAttribute
{
    public RequireAllResourcesAttribute(string action, string[] resources)
    {
        var policies = resources.Select(resource => SystemPermission.NameFor(action, resource));

        // Join the policies using AND logic
        Policy = string.Join(" AND ", policies);
    }
}