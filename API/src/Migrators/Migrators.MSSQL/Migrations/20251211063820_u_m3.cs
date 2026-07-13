using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.MSSQL.Migrations
{
    /// <inheritdoc />
    public partial class u_m3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppointmentParticipant",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Appointments",
                schema: "dbo");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Appointments",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FKTempAppointmentsId = table.Column<int>(type: "int", nullable: false),
                    AppointmentStatus = table.Column<int>(type: "int", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    DeletedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    EndAtDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    EndAtTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LocationType = table.Column<int>(type: "int", nullable: false),
                    StartAtDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    StartAtTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false)
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
                name: "AppointmentParticipant",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FKAppointmentsPKId = table.Column<int>(type: "int", nullable: false),
                    TempAppointmentParticipantId = table.Column<int>(type: "int", nullable: false),
                    AppointmentParticipantResponseStatus = table.Column<int>(type: "int", nullable: false),
                    AppointmentParticipantRole = table.Column<int>(type: "int", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    DeletedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    FKApplicationUserPKId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FKTempAppointmentParticipantsPKId = table.Column<int>(type: "int", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RespondedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    ThirdPartyAppointmentUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UrlIdentifier = table.Column<string>(type: "nvarchar(max)", nullable: false)
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
        }
    }
}
