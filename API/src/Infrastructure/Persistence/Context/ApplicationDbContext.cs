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

    public DbSet<Tasks> Tasks => Set<Tasks>();

    public DbSet<LeadVisits> LeadVisits => Set<LeadVisits>();

    public DbSet<GpsLogs> GpsLogs => Set<GpsLogs>();

    public DbSet<GpsVerifications> GpsVerifications => Set<GpsVerifications>();

    public DbSet<LeadImages> LeadImages => Set<LeadImages>();
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

        modelBuilder.HasDefaultSchema(SchemaNames.dbo);

        base.OnModelCreating(modelBuilder);
    }
}
