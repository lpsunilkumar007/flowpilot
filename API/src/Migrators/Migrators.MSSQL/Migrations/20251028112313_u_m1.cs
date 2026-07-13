using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.MSSQL.Migrations
{
    /// <inheritdoc />
    public partial class u_m1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HRDocuments",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Employees",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Departments",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Designations",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Levels",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Positions",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Salaries",
                schema: "dbo");

            migrationBuilder.CreateTable(
                name: "TempAppointments",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    ApprovalRule = table.Column<int>(type: "int", nullable: false),
                    LocationType = table.Column<int>(type: "int", nullable: false),
                    AppointmentStatus = table.Column<int>(type: "int", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TempAppointments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Appointments",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FKTempAppointmentsId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    StartAtDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndAtDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StartAtTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndAtTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LocationType = table.Column<int>(type: "int", nullable: false),
                    AppointmentStatus = table.Column<int>(type: "int", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Appointments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Appointments_TempAppointments_FKTempAppointmentsId",
                        column: x => x.FKTempAppointmentsId,
                        principalSchema: "dbo",
                        principalTable: "TempAppointments",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TempAppointmentAvailabilityWindow",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FKTempAppointmentsPKId = table.Column<int>(type: "int", nullable: false),
                    OnDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TimeFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TimeTo = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TempAppointmentAvailabilityWindow", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TempAppointmentAvailabilityWindow_TempAppointments_FKTempAppointmentsPKId",
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
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FKTempAppointmentsPKId = table.Column<int>(type: "int", nullable: false),
                    FKApplicationUserPKId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AppointmentParticipantRole = table.Column<int>(type: "int", nullable: false),
                    AppointmentParticipantResponseStatus = table.Column<int>(type: "int", nullable: false),
                    RespondedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TempAppointmentParticipants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TempAppointmentParticipants_TempAppointments_FKTempAppointmentsPKId",
                        column: x => x.FKTempAppointmentsPKId,
                        principalSchema: "dbo",
                        principalTable: "TempAppointments",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "AppointmentParticipant",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FKTempAppointmentParticipantsPKId = table.Column<int>(type: "int", nullable: false),
                    TempAppointmentParticipantId = table.Column<int>(type: "int", nullable: false),
                    FKAppointmentsPKId = table.Column<int>(type: "int", nullable: false),
                    FKApplicationUserPKId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AppointmentParticipantRole = table.Column<int>(type: "int", nullable: false),
                    AppointmentParticipantResponseStatus = table.Column<int>(type: "int", nullable: false),
                    RespondedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AppointmentUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppointmentParticipant", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppointmentParticipant_Appointments_FKAppointmentsPKId",
                        column: x => x.FKAppointmentsPKId,
                        principalSchema: "dbo",
                        principalTable: "Appointments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppointmentParticipant_TempAppointmentParticipants_TempAppointmentParticipantId",
                        column: x => x.TempAppointmentParticipantId,
                        principalSchema: "dbo",
                        principalTable: "TempAppointmentParticipants",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TempAppointmentAvailabilityProposedWindow",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FKTempAppointmentsPKId = table.Column<int>(type: "int", nullable: false),
                    OnDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TimeFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TimeTo = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FKTempAppointmentParticipantsPkId = table.Column<int>(type: "int", nullable: false),
                    AppointmentAvailabilityProposedWindowStatus = table.Column<int>(type: "int", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TempAppointmentAvailabilityProposedWindow", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TempAppointmentAvailabilityProposedWindow_TempAppointmentParticipants_FKTempAppointmentParticipantsPkId",
                        column: x => x.FKTempAppointmentParticipantsPkId,
                        principalSchema: "dbo",
                        principalTable: "TempAppointmentParticipants",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TempAppointmentAvailabilityProposedWindow_TempAppointments_FKTempAppointmentsPKId",
                        column: x => x.FKTempAppointmentsPKId,
                        principalSchema: "dbo",
                        principalTable: "TempAppointments",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppointmentParticipant_FKAppointmentsPKId",
                schema: "dbo",
                table: "AppointmentParticipant",
                column: "FKAppointmentsPKId");

            migrationBuilder.CreateIndex(
                name: "IX_AppointmentParticipant_TempAppointmentParticipantId",
                schema: "dbo",
                table: "AppointmentParticipant",
                column: "TempAppointmentParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_FKTempAppointmentsId",
                schema: "dbo",
                table: "Appointments",
                column: "FKTempAppointmentsId");

            migrationBuilder.CreateIndex(
                name: "IX_TempAppointmentAvailabilityProposedWindow_FKTempAppointmentParticipantsPkId",
                schema: "dbo",
                table: "TempAppointmentAvailabilityProposedWindow",
                column: "FKTempAppointmentParticipantsPkId");

            migrationBuilder.CreateIndex(
                name: "IX_TempAppointmentAvailabilityProposedWindow_FKTempAppointmentsPKId",
                schema: "dbo",
                table: "TempAppointmentAvailabilityProposedWindow",
                column: "FKTempAppointmentsPKId");

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppointmentParticipant",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "TempAppointmentAvailabilityProposedWindow",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "TempAppointmentAvailabilityWindow",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Appointments",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "TempAppointmentParticipants",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "TempAppointments",
                schema: "dbo");

            migrationBuilder.CreateTable(
                name: "Departments",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ParentDepartmentId = table.Column<int>(type: "int", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DepartmentName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ParentDeptID = table.Column<int>(type: "int", nullable: true),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Departments_Departments_ParentDepartmentId",
                        column: x => x.ParentDepartmentId,
                        principalSchema: "dbo",
                        principalTable: "Departments",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Designations",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Designations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Levels",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Abbreviation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Levels", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Positions",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PositionTitle = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Positions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Salaries",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Allowances = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Basic = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Deductions = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EffectiveFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    HRA = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Salaries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Employees",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DepartmentID = table.Column<int>(type: "int", nullable: true),
                    DesignationID = table.Column<int>(type: "int", nullable: true),
                    LevelID = table.Column<int>(type: "int", nullable: true),
                    PositionID = table.Column<int>(type: "int", nullable: true),
                    ReportingManagerID = table.Column<int>(type: "int", nullable: true),
                    SalaryID = table.Column<int>(type: "int", nullable: true),
                    Aadhaar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DOJ = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PAN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Employees_Departments_DepartmentID",
                        column: x => x.DepartmentID,
                        principalSchema: "dbo",
                        principalTable: "Departments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Employees_Designations_DesignationID",
                        column: x => x.DesignationID,
                        principalSchema: "dbo",
                        principalTable: "Designations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Employees_Employees_ReportingManagerID",
                        column: x => x.ReportingManagerID,
                        principalSchema: "dbo",
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Employees_Levels_LevelID",
                        column: x => x.LevelID,
                        principalSchema: "dbo",
                        principalTable: "Levels",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Employees_Positions_PositionID",
                        column: x => x.PositionID,
                        principalSchema: "dbo",
                        principalTable: "Positions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Employees_Salaries_SalaryID",
                        column: x => x.SalaryID,
                        principalSchema: "dbo",
                        principalTable: "Salaries",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "HRDocuments",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DocumentPath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DocumentType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    UploadedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HRDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HRDocuments_Employees_EmployeeID",
                        column: x => x.EmployeeID,
                        principalSchema: "dbo",
                        principalTable: "Employees",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Departments_ParentDepartmentId",
                schema: "dbo",
                table: "Departments",
                column: "ParentDepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_DepartmentID",
                schema: "dbo",
                table: "Employees",
                column: "DepartmentID");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_DesignationID",
                schema: "dbo",
                table: "Employees",
                column: "DesignationID");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_LevelID",
                schema: "dbo",
                table: "Employees",
                column: "LevelID");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_PositionID",
                schema: "dbo",
                table: "Employees",
                column: "PositionID");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_ReportingManagerID",
                schema: "dbo",
                table: "Employees",
                column: "ReportingManagerID");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_SalaryID",
                schema: "dbo",
                table: "Employees",
                column: "SalaryID");

            migrationBuilder.CreateIndex(
                name: "IX_HRDocuments_EmployeeID",
                schema: "dbo",
                table: "HRDocuments",
                column: "EmployeeID");
        }
    }
}
