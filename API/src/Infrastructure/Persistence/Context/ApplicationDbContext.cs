using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Domain.Appointment;
using FlowPilot.Domain.Common;
using FlowPilot.Domain.CRM;
using FlowPilot.Domain.Email;
using FlowPilot.Domain.FormDesigner;
using FlowPilot.Domain.LookUp;
using FlowPilot.Domain.Setting;
using FlowPilot.Infrastructure.Persistence.Configuration;
using FlowPilot.Infrastructure.Persistence.Context.Auditing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace FlowPilot.Infrastructure.Persistence.Context;
public class ApplicationDbContext : BaseDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ICurrentUser currentUser, ISerializerService serializer, IOptions<DatabaseSettings> dbSettings, AuditingDbContext auditingDbContext, IDateTimeService createdTimeService)
: base(options, currentUser, serializer, dbSettings, auditingDbContext, createdTimeService)
    {
    }

    public DbSet<EmailLog> EmailLog => Set<EmailLog>();

    public DbSet<LookUpCodes> LookUpCodes => Set<LookUpCodes>();

    public DbSet<LookUpCodeValues> LookUpCodeValues => Set<LookUpCodeValues>();

    public DbSet<Settings> Settings => Set<Settings>();

    public DbSet<TempAppointments> TempAppointments => Set<TempAppointments>();

    public DbSet<TempAppointmentAvailabilityProposedWindow> TempAppointmentAvailabilityProposedWindow => Set<TempAppointmentAvailabilityProposedWindow>();

    public DbSet<TempAppointmentAvailabilityWindow> TempAppointmentAvailabilityWindow => Set<TempAppointmentAvailabilityWindow>();

    public DbSet<TempAppointmentParticipants> TempAppointmentParticipants => Set<TempAppointmentParticipants>();

    public DbSet<EmailTemplates> EmailTemplates => Set<EmailTemplates>();

    public DbSet<Offerings> Offerings => Set<Offerings>();

    #region FormDesigner
    public DbSet<FormStructures> FormStructures => Set<FormStructures>();

    public DbSet<FormPages> FormPages => Set<FormPages>();

    public DbSet<FormPageTabs> FormPageTabs => Set<FormPageTabs>();

    public DbSet<FormPageFields> FormPageFields => Set<FormPageFields>();

    public DbSet<FormPageFieldOptions> FormPageFieldOptions => Set<FormPageFieldOptions>();

    #endregion

    #region CRM
    public DbSet<Leads> Leads => Set<Leads>();

    public DbSet<LeadContacts> LeadContacts => Set<LeadContacts>();

    public DbSet<LeadActivities> LeadActivities => Set<LeadActivities>();

    public DbSet<LeadFollowUps> LeadFollowUps => Set<LeadFollowUps>();

    public DbSet<LeadStatusHistories> LeadStatusHistories => Set<LeadStatusHistories>();

    public DbSet<LeadAssignmentHistories> LeadAssignmentHistories => Set<LeadAssignmentHistories>();

    public DbSet<EntityNotes> EntityNotes => Set<EntityNotes>();

    public DbSet<EntityCustomFields> EntityCustomFields => Set<EntityCustomFields>();

    public DbSet<Tasks> Tasks => Set<Tasks>();

    public DbSet<LeadVisits> LeadVisits => Set<LeadVisits>();

    public DbSet<GpsLogs> GpsLogs => Set<GpsLogs>();

    public DbSet<GpsVerifications> GpsVerifications => Set<GpsVerifications>();

    public DbSet<LeadImages> LeadImages => Set<LeadImages>();

    public DbSet<Campaigns> Campaigns => Set<Campaigns>();

    public DbSet<CampaignUsers> CampaignUsers => Set<CampaignUsers>();
    #endregion

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

        modelBuilder.Entity<Tasks>()
            .ToTable("Tasks")
            .HasIndex(x => x.Uuid)
            .IsUnique();

        modelBuilder.Entity<Offerings>()
            .HasIndex(x => x.UniqueId)
            .IsUnique();

        modelBuilder.Entity<Leads>()
            .HasOne(x => x.Offering)
            .WithMany(x => x.Leads)
            .HasForeignKey(x => x.FKOfferingId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Leads>()
            .HasOne(x => x.LeadSource)
            .WithMany()
            .HasForeignKey(x => x.FKLeadSourceId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Leads>()
            .HasOne(x => x.LeadStatus)
            .WithMany()
            .HasForeignKey(x => x.FKLeadStatusId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<LeadStatusHistories>()
            .HasOne(x => x.FromStatus)
            .WithMany()
            .HasForeignKey(x => x.FKFromStatusId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<LeadStatusHistories>()
            .HasOne(x => x.ToStatus)
            .WithMany()
            .HasForeignKey(x => x.FKToStatusId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<GpsLogs>()
            .HasOne(x => x.Verification)
            .WithOne(x => x.GpsLog)
            .HasForeignKey<GpsVerifications>(x => x.FKGpsLogPKId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<EntityCustomFields>()
            .HasIndex(x => new { x.TenantId, x.EntityType, x.FKEntityPKId });

        modelBuilder.Entity<Campaigns>()
            .HasOne(x => x.EmailTemplate)
            .WithMany()
            .HasForeignKey(x => x.TemplateId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<CampaignUsers>()
            .HasOne(x => x.Campaign)
            .WithMany(x => x.CampaignUsers)
            .HasForeignKey(x => x.CampaignId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<CampaignUsers>()
            .HasIndex(x => new { x.CampaignId, x.UserId })
            .IsUnique();

        modelBuilder.HasDefaultSchema(SchemaNames.dbo);

        base.OnModelCreating(modelBuilder);
    }
}
