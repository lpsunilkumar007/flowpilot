using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.MSSQL.Migrations
{
    /// <inheritdoc />
    public partial class CRM_LeadManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EntityNotes",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EntityNoteType = table.Column<int>(type: "int", nullable: false),
                    FKEntityPKId = table.Column<int>(type: "int", nullable: false),
                    NoteText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EntityNotes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Leads",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BusinessName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BusinessType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CurrentPOS = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Website = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GstNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Pan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NumberOfOutlets = table.Column<int>(type: "int", nullable: true),
                    ExpectedMonthlyBilling = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ExpectedRevenue = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CompanySize = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LeadSource = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FKAssignedToUserId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    LeadStatus = table.Column<int>(type: "int", nullable: false),
                    ExpectedClosingDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    InterestLevel = table.Column<int>(type: "int", nullable: false),
                    Country = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    State = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Area = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Pincode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FullAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GoogleMapsLink = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PainPoints = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Competitors = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Requirements = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastActivityDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    NextFollowUpDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    IsArchived = table.Column<bool>(type: "bit", nullable: false),
                    ConvertedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    FKConvertedCustomerId = table.Column<int>(type: "int", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Leads", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LeadActivities",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FKLeadPKId = table.Column<int>(type: "int", nullable: false),
                    ActivityType = table.Column<int>(type: "int", nullable: false),
                    ActivityDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ActivityTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    DurationMinutes = table.Column<int>(type: "int", nullable: true),
                    Outcome = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NextFollowUpDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    AttachmentUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
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
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FKLeadPKId = table.Column<int>(type: "int", nullable: false),
                    FromUserId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ToUserId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AssignedByUserId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AssignedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
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
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FKLeadPKId = table.Column<int>(type: "int", nullable: false),
                    OwnerName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Mobile = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WhatsApp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AlternatePhone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
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
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FKLeadPKId = table.Column<int>(type: "int", nullable: false),
                    NextFollowUpDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    FollowUpType = table.Column<int>(type: "int", nullable: false),
                    FollowUpStatus = table.Column<int>(type: "int", nullable: false),
                    ReminderNote = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
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
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FKLeadPKId = table.Column<int>(type: "int", nullable: false),
                    FromStatus = table.Column<int>(type: "int", nullable: true),
                    ToStatus = table.Column<int>(type: "int", nullable: false),
                    ChangedByUserId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ChangedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
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
                });

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
                name: "IX_LeadStatusHistories_FKLeadPKId",
                schema: "dbo",
                table: "LeadStatusHistories",
                column: "FKLeadPKId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EntityNotes",
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
                name: "LeadStatusHistories",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Leads",
                schema: "dbo");
        }
    }
}
