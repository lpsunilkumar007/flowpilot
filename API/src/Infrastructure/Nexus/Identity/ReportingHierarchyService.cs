using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Application.Nexus.Identity.Users;
using FlowPilot.Infrastructure.Persistence.Context.Nexus;
using FlowPilot.Infrastructure.SystemConstants;
using FlowPilot.Shared.Authorization;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Nexus.Identity;

internal class ReportingHierarchyService : IReportingHierarchyService
{
    private readonly NexusDbContext _nexusDbContext;
    private readonly ICurrentUser _currentUser;

    public ReportingHierarchyService(NexusDbContext nexusDbContext, ICurrentUser currentUser)
    {
        _nexusDbContext = nexusDbContext;
        _currentUser = currentUser;
    }

    public Task<bool> IsTenantAdminAsync(CancellationToken cancellationToken = default)
    {
        string adminRole = SystemRoles.FormatTenantRoleName(SystemRoles.Admin, _currentUser.GetTenant());
        return Task.FromResult(_currentUser.IsInRole(adminRole));
    }

    public async Task<IReadOnlyCollection<string>> GetAccessibleUserIdsAsync(CancellationToken cancellationToken = default)
    {
        if (await IsTenantAdminAsync(cancellationToken))
        {
            return await _nexusDbContext.Users
                .AsNoTracking()
                .Where(u => u.FKTenantId == _currentUser.GetTenant())
                .Select(u => u.Id)
                .ToListAsync(cancellationToken);
        }

        string currentUserId = _currentUser.GetUserId().ToString();
        var tree = await LoadTenantReportingMapAsync(_currentUser.GetTenant(), cancellationToken);
        var accessible = new HashSet<string>(StringComparer.Ordinal) { currentUserId };
        CollectSubtree(currentUserId, tree, accessible);
        return accessible;
    }

    public async Task<ReportingRelation> GetRelationAsync(string targetUserId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(targetUserId))
        {
            return ReportingRelation.None;
        }

        if (await IsTenantAdminAsync(cancellationToken))
        {
            return ReportingRelation.Self;
        }

        string currentUserId = _currentUser.GetUserId().ToString();
        if (string.Equals(currentUserId, targetUserId, StringComparison.Ordinal))
        {
            return ReportingRelation.Self;
        }

        var tree = await LoadTenantReportingMapAsync(_currentUser.GetTenant(), cancellationToken);
        int? distance = GetDistanceDownTree(currentUserId, targetUserId, tree);
        return distance switch
        {
            1 => ReportingRelation.DirectReport,
            > 1 => ReportingRelation.IndirectReport,
            _ => ReportingRelation.None
        };
    }

    public async Task<bool> CanReadAsync(string? assignedToUserId, CancellationToken cancellationToken = default)
    {
        if (await IsTenantAdminAsync(cancellationToken))
        {
            return true;
        }

        if (string.IsNullOrWhiteSpace(assignedToUserId))
        {
            return false;
        }

        var relation = await GetRelationAsync(assignedToUserId, cancellationToken);
        return relation is ReportingRelation.Self or ReportingRelation.DirectReport or ReportingRelation.IndirectReport;
    }

    public async Task<bool> CanWriteAsync(string? assignedToUserId, CancellationToken cancellationToken = default)
    {
        if (await IsTenantAdminAsync(cancellationToken))
        {
            return true;
        }

        if (string.IsNullOrWhiteSpace(assignedToUserId))
        {
            return false;
        }

        var relation = await GetRelationAsync(assignedToUserId, cancellationToken);
        return relation is ReportingRelation.Self or ReportingRelation.DirectReport;
    }

    public async Task EnsureValidReportsToAsync(string userId, string? reportsToUserId, int tenantId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(reportsToUserId))
        {
            return;
        }

        if (string.Equals(userId, reportsToUserId, StringComparison.Ordinal))
        {
            throw new BadRequestException(ErrorMessages.InvalidReportsToUser);
        }

        var manager = await _nexusDbContext.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.Id == reportsToUserId && u.FKTenantId == tenantId, cancellationToken);

        if (manager is null)
        {
            throw new BadRequestException(ErrorMessages.InvalidReportsToUser);
        }

        var tree = await LoadTenantReportingMapAsync(tenantId, cancellationToken);
        tree[userId] = reportsToUserId;

        if (WouldCreateCycle(userId, tree))
        {
            throw new BadRequestException(ErrorMessages.ReportsToCycle);
        }
    }

    public async Task<IReadOnlyDictionary<string, int>> GetReportDistancesAsync(CancellationToken cancellationToken = default)
    {
        string currentUserId = _currentUser.GetUserId().ToString();
        var tree = await LoadTenantReportingMapAsync(_currentUser.GetTenant(), cancellationToken);
        var distances = new Dictionary<string, int>(StringComparer.Ordinal);

        void Walk(string managerId, int distance)
        {
            foreach (var pair in tree)
            {
                if (!string.Equals(pair.Value, managerId, StringComparison.Ordinal))
                {
                    continue;
                }

                distances[pair.Key] = distance;
                Walk(pair.Key, distance + 1);
            }
        }

        Walk(currentUserId, 1);
        return distances;
    }

    private async Task<Dictionary<string, string?>> LoadTenantReportingMapAsync(int tenantId, CancellationToken cancellationToken)
    {
        var users = await _nexusDbContext.Users
            .AsNoTracking()
            .Where(u => u.FKTenantId == tenantId)
            .Select(u => new { u.Id, u.FKReportsToUserId })
            .ToListAsync(cancellationToken);

        return users.ToDictionary(u => u.Id, u => u.FKReportsToUserId, StringComparer.Ordinal);
    }

    private static void CollectSubtree(string managerId, Dictionary<string, string?> reportsToMap, HashSet<string> result)
    {
        foreach (var pair in reportsToMap)
        {
            if (string.Equals(pair.Value, managerId, StringComparison.Ordinal) && result.Add(pair.Key))
            {
                CollectSubtree(pair.Key, reportsToMap, result);
            }
        }
    }

    private static int? GetDistanceDownTree(string managerId, string targetUserId, Dictionary<string, string?> reportsToMap)
    {
        int distance = 0;
        string? cursor = targetUserId;
        var visited = new HashSet<string>(StringComparer.Ordinal);

        while (!string.IsNullOrWhiteSpace(cursor) && visited.Add(cursor))
        {
            if (!reportsToMap.TryGetValue(cursor, out string? reportsTo) || string.IsNullOrWhiteSpace(reportsTo))
            {
                return null;
            }

            distance++;
            if (string.Equals(reportsTo, managerId, StringComparison.Ordinal))
            {
                return distance;
            }

            cursor = reportsTo;
        }

        return null;
    }

    private static bool WouldCreateCycle(string userId, Dictionary<string, string?> reportsToMap)
    {
        string? cursor = userId;
        var visited = new HashSet<string>(StringComparer.Ordinal);

        while (!string.IsNullOrWhiteSpace(cursor) && visited.Add(cursor))
        {
            if (!reportsToMap.TryGetValue(cursor, out string? reportsTo) || string.IsNullOrWhiteSpace(reportsTo))
            {
                return false;
            }

            cursor = reportsTo;
        }

        return true;
    }
}
