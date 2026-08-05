using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Migrators.PostgreSQL.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "dbo");

            migrationBuilder.CreateTable(
                name: "EmailLog",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    To = table.Column<List<string>>(type: "text[]", nullable: false),
                    Subject = table.Column<string>(type: "text", nullable: false),
                    EmailType = table.Column<int>(type: "integer", nullable: false),
                    Body = table.Column<string>(type: "text", nullable: false),
                    From = table.Column<string>(type: "text", nullable: false),
                    DisplayName = table.Column<string>(type: "text", nullable: false),
                    ReplyTo = table.Column<string>(type: "text", nullable: true),
                    ReplyToName = table.Column<string>(type: "text", nullable: true),
                    Bcc = table.Column<List<string>>(type: "text[]", nullable: true),
                    Cc = table.Column<List<string>>(type: "text[]", nullable: true),
                    Headers = table.Column<string>(type: "text", nullable: true),
                    EmailSmtpUsed = table.Column<string>(type: "text", nullable: true),
                    IsEmailSent = table.Column<bool>(type: "boolean", nullable: false),
                    EmailSentMessage = table.Column<string>(type: "text", nullable: true),
                    IsTestModeEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    SendGridMessageId = table.Column<string>(type: "text", nullable: true),
                    EmailToUserIds = table.Column<List<Guid>>(type: "uuid[]", nullable: true),
                    EmailBccUserIds = table.Column<List<Guid>>(type: "uuid[]", nullable: true),
                    EmailCcUserIds = table.Column<List<Guid>>(type: "uuid[]", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailLog", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EmailTemplates",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    TemplateUsedFor = table.Column<int>(type: "integer", nullable: false),
                    EmailSubject = table.Column<string>(type: "text", nullable: false),
                    EmailBody = table.Column<string>(type: "text", nullable: false),
                    IsShared = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EntityNotes",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EntityNoteType = table.Column<int>(type: "integer", nullable: false),
                    FKEntityPKId = table.Column<int>(type: "integer", nullable: false),
                    NoteText = table.Column<string>(type: "text", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EntityNotes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FormStructures",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    FormStatus = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IntroductionText = table.Column<string>(type: "text", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormStructures", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LookUpCodes",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LookUpCodeType = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LookUpCodes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Settings",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SettingType = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    OriginalValue = table.Column<string>(type: "text", nullable: false),
                    SettingValues = table.Column<string>(type: "text", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Settings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tasks",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Uuid = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    When = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Bucket = table.Column<int>(type: "integer", nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: true),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tasks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TempAppointments",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    CancellationReason = table.Column<string>(type: "text", nullable: true),
                    FKCancelledByApplicationUserPKId = table.Column<string>(type: "text", nullable: true),
                    FKTempAppointmentPkId = table.Column<int>(type: "integer", nullable: true),
                    ApprovalRule = table.Column<int>(type: "integer", nullable: false),
                    LocationType = table.Column<int>(type: "integer", nullable: false),
                    AppointmentStatus = table.Column<int>(type: "integer", nullable: false),
                    MultipleParticipantPerSlot = table.Column<int>(type: "integer", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TempAppointments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TempAppointments_TempAppointments_FKTempAppointmentPkId",
                        column: x => x.FKTempAppointmentPkId,
                        principalSchema: "dbo",
                        principalTable: "TempAppointments",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "FormPages",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FKFormStructurePKId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IntroText = table.Column<string>(type: "text", nullable: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormPages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormPages_FormStructures_FKFormStructurePKId",
                        column: x => x.FKFormStructurePKId,
                        principalSchema: "dbo",
                        principalTable: "FormStructures",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LookUpCodeValues",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LookUpValue = table.Column<string>(type: "text", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    FKLookUpCodePKId = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LookUpCodeValues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LookUpCodeValues_LookUpCodes_FKLookUpCodePKId",
                        column: x => x.FKLookUpCodePKId,
                        principalSchema: "dbo",
                        principalTable: "LookUpCodes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TempAppointmentAvailabilityWindow",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FKTempAppointmentsPKId = table.Column<int>(type: "integer", nullable: false),
                    OnDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    TimeFrom = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    TimeTo = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TempAppointmentAvailabilityWindow", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TempAppointmentAvailabilityWindow_TempAppointments_FKTempAp~",
                        column: x => x.FKTempAppointmentsPKId,
                        principalSchema: "dbo",
                        principalTable: "TempAppointments",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TempAppointmentParticipants",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FKTempAppointmentsPKId = table.Column<int>(type: "integer", nullable: false),
                    FKApplicationUserPKId = table.Column<string>(type: "text", nullable: false),
                    AppointmentParticipantRole = table.Column<int>(type: "integer", nullable: false),
                    AppointmentParticipantResponseStatus = table.Column<int>(type: "integer", nullable: false),
                    ApprovedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeclinedReason = table.Column<string>(type: "text", nullable: true),
                    DeclinedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    UrlIdentifier = table.Column<string>(type: "text", nullable: false),
                    ApproveForDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    ApproveTimeFrom = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    ApproveTimeTo = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    TimeZone = table.Column<string>(type: "text", nullable: false),
                    MeetingUrlIdentifier = table.Column<string>(type: "text", nullable: false),
                    MeetingParticipantPresenceStatus = table.Column<int>(type: "integer", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TempAppointmentParticipants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TempAppointmentParticipants_TempAppointments_FKTempAppointm~",
                        column: x => x.FKTempAppointmentsPKId,
                        principalSchema: "dbo",
                        principalTable: "TempAppointments",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "FormPageTabs",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FKFormPagePKId = table.Column<int>(type: "integer", nullable: false),
                    FKFormPageTabPKId = table.Column<int>(type: "integer", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormPageTabs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormPageTabs_FormPageTabs_FKFormPageTabPKId",
                        column: x => x.FKFormPageTabPKId,
                        principalSchema: "dbo",
                        principalTable: "FormPageTabs",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FormPageTabs_FormPages_FKFormPagePKId",
                        column: x => x.FKFormPagePKId,
                        principalSchema: "dbo",
                        principalTable: "FormPages",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Leads",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BusinessName = table.Column<string>(type: "text", nullable: false),
                    BusinessType = table.Column<string>(type: "text", nullable: false),
                    CurrentPOS = table.Column<string>(type: "text", nullable: true),
                    Website = table.Column<string>(type: "text", nullable: true),
                    GstNumber = table.Column<string>(type: "text", nullable: true),
                    Pan = table.Column<string>(type: "text", nullable: true),
                    NumberOfOutlets = table.Column<int>(type: "integer", nullable: true),
                    ExpectedMonthlyBilling = table.Column<decimal>(type: "numeric", nullable: true),
                    ExpectedRevenue = table.Column<decimal>(type: "numeric", nullable: true),
                    CompanySize = table.Column<string>(type: "text", nullable: true),
                    FKLeadSourceId = table.Column<int>(type: "integer", nullable: false),
                    FKAssignedToUserId = table.Column<string>(type: "text", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    FKLeadStatusId = table.Column<int>(type: "integer", nullable: false),
                    ExpectedClosingDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    InterestLevel = table.Column<int>(type: "integer", nullable: false),
                    Country = table.Column<string>(type: "text", nullable: true),
                    State = table.Column<string>(type: "text", nullable: true),
                    City = table.Column<string>(type: "text", nullable: true),
                    Area = table.Column<string>(type: "text", nullable: true),
                    Pincode = table.Column<string>(type: "text", nullable: true),
                    FullAddress = table.Column<string>(type: "text", nullable: true),
                    GoogleMapsLink = table.Column<string>(type: "text", nullable: true),
                    PlaceId = table.Column<string>(type: "text", nullable: true),
                    Latitude = table.Column<decimal>(type: "numeric", nullable: true),
                    Longitude = table.Column<decimal>(type: "numeric", nullable: true),
                    PainPoints = table.Column<string>(type: "text", nullable: true),
                    Competitors = table.Column<string>(type: "text", nullable: true),
                    Requirements = table.Column<string>(type: "text", nullable: true),
                    LastActivityDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    NextFollowUpDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false),
                    ConvertedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKConvertedCustomerId = table.Column<int>(type: "integer", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Leads", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Leads_LookUpCodeValues_FKLeadSourceId",
                        column: x => x.FKLeadSourceId,
                        principalSchema: "dbo",
                        principalTable: "LookUpCodeValues",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Leads_LookUpCodeValues_FKLeadStatusId",
                        column: x => x.FKLeadStatusId,
                        principalSchema: "dbo",
                        principalTable: "LookUpCodeValues",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TempAppointmentAvailabilityProposedWindow",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FKTempAppointmentsPKId = table.Column<int>(type: "integer", nullable: false),
                    OnDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    TimeFrom = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    TimeTo = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKTempAppointmentParticipantsPkId = table.Column<int>(type: "integer", nullable: false),
                    AppointmentAvailabilityProposedWindowStatus = table.Column<int>(type: "integer", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TempAppointmentAvailabilityProposedWindow", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TempAppointmentAvailabilityProposedWindow_TempAppointmentPa~",
                        column: x => x.FKTempAppointmentParticipantsPkId,
                        principalSchema: "dbo",
                        principalTable: "TempAppointmentParticipants",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TempAppointmentAvailabilityProposedWindow_TempAppointments_~",
                        column: x => x.FKTempAppointmentsPKId,
                        principalSchema: "dbo",
                        principalTable: "TempAppointments",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "FormPageFields",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FKFormPagePKId = table.Column<int>(type: "integer", nullable: false),
                    FKFormPageFieldTabId = table.Column<int>(type: "integer", nullable: true),
                    FormPageFieldType = table.Column<int>(type: "integer", nullable: false),
                    Label = table.Column<string>(type: "text", nullable: false),
                    FieldKey = table.Column<Guid>(type: "uuid", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    IsAdditionalCommentAllowed = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormPageFields", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormPageFields_FormPageTabs_FKFormPageFieldTabId",
                        column: x => x.FKFormPageFieldTabId,
                        principalSchema: "dbo",
                        principalTable: "FormPageTabs",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FormPageFields_FormPages_FKFormPagePKId",
                        column: x => x.FKFormPagePKId,
                        principalSchema: "dbo",
                        principalTable: "FormPages",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LeadActivities",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FKLeadPKId = table.Column<int>(type: "integer", nullable: false),
                    ActivityType = table.Column<int>(type: "integer", nullable: false),
                    ActivityDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ActivityTime = table.Column<TimeSpan>(type: "interval", nullable: true),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: true),
                    Outcome = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    NextFollowUpDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    AttachmentUrl = table.Column<string>(type: "text", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadActivities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeadActivities_Leads_FKLeadPKId",
                        column: x => x.FKLeadPKId,
                        principalSchema: "dbo",
                        principalTable: "Leads",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LeadAssignmentHistories",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FKLeadPKId = table.Column<int>(type: "integer", nullable: false),
                    FromUserId = table.Column<string>(type: "text", nullable: true),
                    ToUserId = table.Column<string>(type: "text", nullable: false),
                    AssignedByUserId = table.Column<string>(type: "text", nullable: false),
                    AssignedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadAssignmentHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeadAssignmentHistories_Leads_FKLeadPKId",
                        column: x => x.FKLeadPKId,
                        principalSchema: "dbo",
                        principalTable: "Leads",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LeadContacts",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FKLeadPKId = table.Column<int>(type: "integer", nullable: false),
                    OwnerName = table.Column<string>(type: "text", nullable: false),
                    Designation = table.Column<string>(type: "text", nullable: true),
                    Mobile = table.Column<string>(type: "text", nullable: false),
                    WhatsApp = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    AlternatePhone = table.Column<string>(type: "text", nullable: true),
                    IsPrimary = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadContacts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeadContacts_Leads_FKLeadPKId",
                        column: x => x.FKLeadPKId,
                        principalSchema: "dbo",
                        principalTable: "Leads",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LeadFollowUps",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FKLeadPKId = table.Column<int>(type: "integer", nullable: false),
                    NextFollowUpDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FollowUpType = table.Column<int>(type: "integer", nullable: false),
                    FollowUpStatus = table.Column<int>(type: "integer", nullable: false),
                    ReminderNote = table.Column<string>(type: "text", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadFollowUps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeadFollowUps_Leads_FKLeadPKId",
                        column: x => x.FKLeadPKId,
                        principalSchema: "dbo",
                        principalTable: "Leads",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LeadStatusHistories",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FKLeadPKId = table.Column<int>(type: "integer", nullable: false),
                    FKFromStatusId = table.Column<int>(type: "integer", nullable: true),
                    FKToStatusId = table.Column<int>(type: "integer", nullable: false),
                    ChangedByUserId = table.Column<string>(type: "text", nullable: false),
                    ChangedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadStatusHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeadStatusHistories_Leads_FKLeadPKId",
                        column: x => x.FKLeadPKId,
                        principalSchema: "dbo",
                        principalTable: "Leads",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_LeadStatusHistories_LookUpCodeValues_FKFromStatusId",
                        column: x => x.FKFromStatusId,
                        principalSchema: "dbo",
                        principalTable: "LookUpCodeValues",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_LeadStatusHistories_LookUpCodeValues_FKToStatusId",
                        column: x => x.FKToStatusId,
                        principalSchema: "dbo",
                        principalTable: "LookUpCodeValues",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LeadVisits",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FKLeadPKId = table.Column<int>(type: "integer", nullable: false),
                    VisitTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadVisits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeadVisits_Leads_FKLeadPKId",
                        column: x => x.FKLeadPKId,
                        principalSchema: "dbo",
                        principalTable: "Leads",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "FormPageFieldOptions",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FKFormPageFieldPKId = table.Column<int>(type: "integer", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: false),
                    Text = table.Column<string>(type: "text", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormPageFieldOptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormPageFieldOptions_FormPageFields_FKFormPageFieldPKId",
                        column: x => x.FKFormPageFieldPKId,
                        principalSchema: "dbo",
                        principalTable: "FormPageFields",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "GpsLogs",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FKLeadVisitPKId = table.Column<int>(type: "integer", nullable: false),
                    Latitude = table.Column<decimal>(type: "numeric", nullable: false),
                    Longitude = table.Column<decimal>(type: "numeric", nullable: false),
                    LoggedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GpsLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GpsLogs_LeadVisits_FKLeadVisitPKId",
                        column: x => x.FKLeadVisitPKId,
                        principalSchema: "dbo",
                        principalTable: "LeadVisits",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LeadImages",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FKLeadVisitPKId = table.Column<int>(type: "integer", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: false),
                    Caption = table.Column<string>(type: "text", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeadImages_LeadVisits_FKLeadVisitPKId",
                        column: x => x.FKLeadVisitPKId,
                        principalSchema: "dbo",
                        principalTable: "LeadVisits",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "GpsVerifications",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FKGpsLogPKId = table.Column<int>(type: "integer", nullable: false),
                    DistanceMeters = table.Column<decimal>(type: "numeric", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GpsVerifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GpsVerifications_GpsLogs_FKGpsLogPKId",
                        column: x => x.FKGpsLogPKId,
                        principalSchema: "dbo",
                        principalTable: "GpsLogs",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_FormPageFieldOptions_FKFormPageFieldPKId",
                schema: "dbo",
                table: "FormPageFieldOptions",
                column: "FKFormPageFieldPKId");

            migrationBuilder.CreateIndex(
                name: "IX_FormPageFields_FKFormPageFieldTabId",
                schema: "dbo",
                table: "FormPageFields",
                column: "FKFormPageFieldTabId");

            migrationBuilder.CreateIndex(
                name: "IX_FormPageFields_FKFormPagePKId",
                schema: "dbo",
                table: "FormPageFields",
                column: "FKFormPagePKId");

            migrationBuilder.CreateIndex(
                name: "IX_FormPages_FKFormStructurePKId",
                schema: "dbo",
                table: "FormPages",
                column: "FKFormStructurePKId");

            migrationBuilder.CreateIndex(
                name: "IX_FormPageTabs_FKFormPagePKId",
                schema: "dbo",
                table: "FormPageTabs",
                column: "FKFormPagePKId");

            migrationBuilder.CreateIndex(
                name: "IX_FormPageTabs_FKFormPageTabPKId",
                schema: "dbo",
                table: "FormPageTabs",
                column: "FKFormPageTabPKId");

            migrationBuilder.CreateIndex(
                name: "IX_GpsLogs_FKLeadVisitPKId",
                schema: "dbo",
                table: "GpsLogs",
                column: "FKLeadVisitPKId");

            migrationBuilder.CreateIndex(
                name: "IX_GpsVerifications_FKGpsLogPKId",
                schema: "dbo",
                table: "GpsVerifications",
                column: "FKGpsLogPKId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LeadActivities_FKLeadPKId",
                schema: "dbo",
                table: "LeadActivities",
                column: "FKLeadPKId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadAssignmentHistories_FKLeadPKId",
                schema: "dbo",
                table: "LeadAssignmentHistories",
                column: "FKLeadPKId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadContacts_FKLeadPKId",
                schema: "dbo",
                table: "LeadContacts",
                column: "FKLeadPKId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadFollowUps_FKLeadPKId",
                schema: "dbo",
                table: "LeadFollowUps",
                column: "FKLeadPKId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadImages_FKLeadVisitPKId",
                schema: "dbo",
                table: "LeadImages",
                column: "FKLeadVisitPKId");

            migrationBuilder.CreateIndex(
                name: "IX_Leads_FKLeadSourceId",
                schema: "dbo",
                table: "Leads",
                column: "FKLeadSourceId");

            migrationBuilder.CreateIndex(
                name: "IX_Leads_FKLeadStatusId",
                schema: "dbo",
                table: "Leads",
                column: "FKLeadStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadStatusHistories_FKFromStatusId",
                schema: "dbo",
                table: "LeadStatusHistories",
                column: "FKFromStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadStatusHistories_FKLeadPKId",
                schema: "dbo",
                table: "LeadStatusHistories",
                column: "FKLeadPKId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadStatusHistories_FKToStatusId",
                schema: "dbo",
                table: "LeadStatusHistories",
                column: "FKToStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadVisits_FKLeadPKId",
                schema: "dbo",
                table: "LeadVisits",
                column: "FKLeadPKId");

            migrationBuilder.CreateIndex(
                name: "IX_LookUpCodeValues_FKLookUpCodePKId",
                schema: "dbo",
                table: "LookUpCodeValues",
                column: "FKLookUpCodePKId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_Uuid",
                schema: "dbo",
                table: "Tasks",
                column: "Uuid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TempAppointmentAvailabilityProposedWindow_FKTempAppointmen~1",
                schema: "dbo",
                table: "TempAppointmentAvailabilityProposedWindow",
                column: "FKTempAppointmentsPKId");

            migrationBuilder.CreateIndex(
                name: "IX_TempAppointmentAvailabilityProposedWindow_FKTempAppointment~",
                schema: "dbo",
                table: "TempAppointmentAvailabilityProposedWindow",
                column: "FKTempAppointmentParticipantsPkId");

            migrationBuilder.CreateIndex(
                name: "IX_TempAppointmentAvailabilityWindow_FKTempAppointmentsPKId",
                schema: "dbo",
                table: "TempAppointmentAvailabilityWindow",
                column: "FKTempAppointmentsPKId");

            migrationBuilder.CreateIndex(
                name: "IX_TempAppointmentParticipants_FKTempAppointmentsPKId",
                schema: "dbo",
                table: "TempAppointmentParticipants",
                column: "FKTempAppointmentsPKId");

            migrationBuilder.CreateIndex(
                name: "IX_TempAppointments_FKTempAppointmentPkId",
                schema: "dbo",
                table: "TempAppointments",
                column: "FKTempAppointmentPkId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmailLog",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "EmailTemplates",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "EntityNotes",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "FormPageFieldOptions",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "GpsVerifications",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "LeadActivities",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "LeadAssignmentHistories",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "LeadContacts",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "LeadFollowUps",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "LeadImages",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "LeadStatusHistories",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Settings",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Tasks",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "TempAppointmentAvailabilityProposedWindow",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "TempAppointmentAvailabilityWindow",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "FormPageFields",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "GpsLogs",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "TempAppointmentParticipants",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "FormPageTabs",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "LeadVisits",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "TempAppointments",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "FormPages",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Leads",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "FormStructures",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "LookUpCodeValues",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "LookUpCodes",
                schema: "dbo");
        }
    }
}
