using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using FlowPilot.Domain.Common.Contracts;
using FlowPilot.Infrastructure.Auditing;
using FlowPilot.Infrastructure.Persistence.Configuration;
using System.Data;

namespace FlowPilot.Infrastructure.Persistence.Context.Auditing;
public class AuditingDbContext : DbContext
{
    public AuditingDbContext(DbContextOptions<AuditingDbContext> options, IOptions<DatabaseSettings> dbSettings)
  : base(options)
    {
    }

    // Used by Dapper
    public IDbConnection Connection => Database.GetDbConnection();

    public DbSet<Trail> AuditTrails => Set<Trail>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {

        #region Foreign key
        var cascadeFKs = modelBuilder.Model.GetEntityTypes().SelectMany(t => t.GetForeignKeys())
                        .Where(fk => !fk.IsOwnership && fk.DeleteBehavior == DeleteBehavior.Cascade);

        foreach (var fk in cascadeFKs)
        {
            fk.DeleteBehavior = DeleteBehavior.NoAction;
        }
        #endregion

        // QueryFilters need to be applied before base.OnModelCreating
        modelBuilder.AppendGlobalQueryFilter<ISoftDelete>(s => !s.IsDeleted);

        modelBuilder.HasDefaultSchema(SchemaNames.Auditing);

        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(GetType().Assembly);
    }
}
