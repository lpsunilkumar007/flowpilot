namespace FlowPilot.Application.Nexus.Identity.Users;

public enum ReportingRelation
{
    None = 0,
    Self = 1,
    DirectReport = 2,
    IndirectReport = 3
}

public interface IReportingHierarchyService : ITransientService
{
    Task<bool> IsTenantAdminAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<string>> GetAccessibleUserIdsAsync(CancellationToken cancellationToken = default);

    Task<ReportingRelation> GetRelationAsync(string targetUserId, CancellationToken cancellationToken = default);

    Task<bool> CanReadAsync(string? assignedToUserId, CancellationToken cancellationToken = default);

    Task<bool> CanWriteAsync(string? assignedToUserId, CancellationToken cancellationToken = default);

    Task EnsureValidReportsToAsync(string userId, string? reportsToUserId, int tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Reporting distances from the current user down their tree (ignores Admin bypass).
    /// Distance 1 = direct, greater than 1 = indirect.
    /// </summary>
    Task<IReadOnlyDictionary<string, int>> GetReportDistancesAsync(CancellationToken cancellationToken = default);
}
