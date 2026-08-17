using System.Security.Claims;
using System.Text.Json;
using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Infrastructure.Persistence;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Infrastructure.Persistence.Context.Auditing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Options;

namespace Migrators.MSSQL;

public class ApplicationDbContextDesignTimeFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        const string connectionString = "Server=(localdb)\\mssqllocaldb;Database=FlowPilotDesignTime;Trusted_Connection=True;TrustServerCertificate=True";

        var settings = Options.Create(new DatabaseSettings
        {
            Application_DBProvider = "mssql",
            Application_ConnectionString = connectionString,
            AuditTrail_DBProvider = "mssql",
            AuditTrail_ConnectionString = connectionString,
            Nexus_DBProvider = "mssql",
            Nexus_ConnectionString = connectionString,
        });

        var auditOptions = new DbContextOptionsBuilder<AuditingDbContext>()
            .UseSqlServer(connectionString, x => x.MigrationsAssembly("Migrators.MSSQL"))
            .Options;

        var appOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer(connectionString, x => x.MigrationsAssembly("Migrators.MSSQL"))
            .Options;

        return new ApplicationDbContext(
            appOptions,
            new DesignTimeCurrentUser(),
            new DesignTimeSerializerService(),
            settings,
            new AuditingDbContext(auditOptions, settings),
            new DesignTimeDateTimeService());
    }
}

internal sealed class DesignTimeCurrentUser : ICurrentUser
{
    public string? Name => "Design Time";

    public Guid GetUserId() => Guid.Empty;

    public string? GetUserEmail() => "design-time@flowpilot.local";

    public int GetTenant() => 1;

    public Guid GetTenantUniqueId() => Guid.Empty;

    public bool IsAuthenticated() => true;

    public bool IsInRole(string role) => false;

    public IEnumerable<Claim>? GetUserClaims() => [];
}

internal sealed class DesignTimeSerializerService : ISerializerService
{
    public string Serialize<T>(T obj) => JsonSerializer.Serialize(obj);

    public string Serialize<T>(T obj, Type type) => JsonSerializer.Serialize(obj, type);

    public T Deserialize<T>(string text) => JsonSerializer.Deserialize<T>(text)!;
}

internal sealed class DesignTimeDateTimeService : IDateTimeService
{
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;

    public DateTimeOffset ConvertToUTCDate(DateTimeOffset DateTimeOffset) => DateTimeOffset.ToUniversalTime();
}
