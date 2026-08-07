using System.Collections.ObjectModel;

namespace FlowPilot.Shared.Authorization;

public class SystemRoles
{
    public const string Admin = nameof(Admin);
    public const string SalesManager = nameof(SalesManager);
    public const string SalesRepresentative = nameof(SalesRepresentative);

    /// <summary>Legacy default role name; migrated to <see cref="SalesRepresentative"/>.</summary>
    public const string Basic = nameof(Basic);

    public static IReadOnlyList<string> DefaultRoles { get; } = new ReadOnlyCollection<string>(new[]
    {
        Admin,
        SalesManager,
        SalesRepresentative
    });

    private static readonly HashSet<string> DefaultOrLegacyRoleNames = new(StringComparer.Ordinal)
    {
        Admin,
        SalesManager,
        SalesRepresentative,
        Basic
    };

    public static bool IsDefault(string roleName) => DefaultOrLegacyRoleNames.Contains(roleName);

    public static bool IsDefaultForTenant(string roleName)
    {
        var parts = roleName.Split(TenantRoleNameSplitter);
        return parts.Length > 1 && IsDefault(parts[1]);
    }

    public static string GetRoleNameWithoutTenantName(string roleName)
    {
        var parts = roleName.Split(TenantRoleNameSplitter);
        return parts.Length > 1 ? parts[1] : roleName;
    }

    public static string FormatTenantRoleName(string roleName, int tenantId)
    {
        return $"{tenantId}{TenantRoleNameSplitter}{roleName}";
    }

    public static string GetFriendlyDescription(string roleName) => roleName switch
    {
        Admin => "Admin Role",
        SalesManager => "Sales Manager Role",
        SalesRepresentative => "Sales Representative Role",
        Basic => "Sales Representative Role",
        _ => $"{roleName} Role"
    };

    public static readonly char TenantRoleNameSplitter = '_';
}
