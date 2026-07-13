using FlowPilot.Infrastructure.Nexus.MultiTenant.DbModels;

namespace FlowPilot.Infrastructure.Persistence.Initialization;
internal interface IDatabaseInitializer
{
    Task InitializeDatabasesAsync(CancellationToken cancellationToken);
    Task InitializeApplicationDbForTenantAsync(Tenants tenant, CancellationToken cancellationToken);
}