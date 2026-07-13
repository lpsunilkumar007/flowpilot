using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using FlowPilot.Infrastructure.Nexus.MultiTenant.DbModels;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Infrastructure.Persistence.Context.Nexus;

namespace FlowPilot.Infrastructure.Persistence.Initialization;
internal class ApplicationDbInitializer
{
    private readonly ApplicationDbContext _dbContext;
    private readonly NexusDbContext _nexusDbContext;
    private readonly ApplicationDbSeeder _dbSeeder;
   

    public ApplicationDbInitializer(ApplicationDbContext dbContext, NexusDbContext nexusDbContext, ApplicationDbSeeder dbSeeder )
    {
        _dbContext = dbContext;
        _dbSeeder = dbSeeder;
         
        _nexusDbContext = nexusDbContext;
    }

    public async Task InitializeAsync(Tenants currentTenant, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrEmpty(currentTenant.ConnectionString))
        {
            _dbContext.Database.SetConnectionString(currentTenant.ConnectionString);
        }

        if (_dbContext.Database.GetMigrations().Any())
        {
            if ((await _dbContext.Database.GetPendingMigrationsAsync(cancellationToken)).Any())
            {
               
                await _dbContext.Database.MigrateAsync(cancellationToken);
            }

            if (await _dbContext.Database.CanConnectAsync(cancellationToken))
            {
                 

                await _dbSeeder.SeedDatabaseAsync(_dbContext, _nexusDbContext, currentTenant, cancellationToken);
            }
        }
    }
}
