using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Infrastructure.Nexus.LookUp.DbModels;
using FlowPilot.Infrastructure.Nexus.MultiTenant.DbModels;
using FlowPilot.Infrastructure.Nexus.Subscription.DbModels;
using FlowPilot.Infrastructure.Persistence.Configuration;
using FlowPilot.Infrastructure.Persistence.Context.Auditing;
using FlowPilot.Infrastructure.Nexus.Localization.DbModels;
using FlowPilot.Infrastructure.ExternalIntegrations.Stripe.DbModels;
using FlowPilot.Infrastructure.Nexus.Identity.DbModels;

namespace FlowPilot.Infrastructure.Persistence.Context.Nexus;

public class NexusDbContext : NexusBaseDbContext
{
    public NexusDbContext(DbContextOptions<NexusDbContext> options, ICurrentUser currentUser, ISerializerService serializer, IOptions<DatabaseSettings> dbSettings, AuditingDbContext auditingDbContext, IDateTimeService createdTimeService)
   : base(options, currentUser, serializer, dbSettings, auditingDbContext, createdTimeService)
    {
    }

    public DbSet<ApplicationUserTwoFactorSession> ApplicationUserTwoFactorSession => Set<ApplicationUserTwoFactorSession>();

    public DbSet<Tenants> Tenants => Set<Tenants>();

    public DbSet<TentantSubscriptionPlan> TenantSubscriptionPlans => Set<TentantSubscriptionPlan>();

    public DbSet<TentantSubscriptionPlanInvoices> TenantSubscriptionPlanInvoices=> Set<TentantSubscriptionPlanInvoices>();

    public DbSet<Subscriptions> Subscriptions => Set<Subscriptions>();

    public DbSet<NexusLookUpCodes> NexusLookUpCodes => Set<NexusLookUpCodes>();

    public DbSet<NexusLookUpCodeValues> NexusLookUpCodeValues => Set<NexusLookUpCodeValues>();

    public DbSet<Country> Country => Set<Country>();

    public DbSet<CountryLocalization> CountryLocalization => Set<CountryLocalization>();

    public DbSet<StripePaymentInitialization> StripePaymentInitializations => Set<StripePaymentInitialization>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<NexusLookUpCodes>()
               .ToTable("NexusLookUpCodes");

        modelBuilder.Entity<NexusLookUpCodeValues>()
             .ToTable("NexusLookUpCodeValues");

        #region Foreign key
        var cascadeFKs = modelBuilder.Model.GetEntityTypes().SelectMany(t => t.GetForeignKeys())
                        .Where(fk => !fk.IsOwnership && fk.DeleteBehavior == DeleteBehavior.Cascade);

        foreach (var fk in cascadeFKs)
        {
            fk.DeleteBehavior = DeleteBehavior.NoAction;
        }
        #endregion

        modelBuilder.HasDefaultSchema(SchemaNames.dbo);

        modelBuilder.Entity<ApplicationUser>()
            .HasOne(u => u.ReportsTo)
            .WithMany(u => u.DirectReports)
            .HasForeignKey(u => u.FKReportsToUserId)
            .OnDelete(DeleteBehavior.Restrict);

        base.OnModelCreating(modelBuilder);
    }
}