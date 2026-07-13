using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.MSSQL.Migrations
{
    /// <inheritdoc />
    public partial class addandUpdateColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Notes",
                schema: "dbo",
                table: "TempAppointmentParticipants");

            migrationBuilder.RenameColumn(
                name: "RespondedAt",
                schema: "dbo",
                table: "TempAppointmentParticipants",
                newName: "ApprovedAt");

            migrationBuilder.RenameColumn(
                name: "ApproveAtTime",
                schema: "dbo",
                table: "TempAppointmentParticipants",
                newName: "ApproveTimeTo");

            migrationBuilder.RenameColumn(
                name: "ApproveAtDate",
                schema: "dbo",
                table: "TempAppointmentParticipants",
                newName: "ApproveTimeFrom");

            migrationBuilder.AddColumn<DateTime>(
                name: "ApproveForDate",
                schema: "dbo",
                table: "TempAppointmentParticipants",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApproveForDate",
                schema: "dbo",
                table: "TempAppointmentParticipants");

            migrationBuilder.RenameColumn(
                name: "ApprovedAt",
                schema: "dbo",
                table: "TempAppointmentParticipants",
                newName: "RespondedAt");

            migrationBuilder.RenameColumn(
                name: "ApproveTimeTo",
                schema: "dbo",
                table: "TempAppointmentParticipants",
                newName: "ApproveAtTime");

            migrationBuilder.RenameColumn(
                name: "ApproveTimeFrom",
                schema: "dbo",
                table: "TempAppointmentParticipants",
                newName: "ApproveAtDate");

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                schema: "dbo",
                table: "TempAppointmentParticipants",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
