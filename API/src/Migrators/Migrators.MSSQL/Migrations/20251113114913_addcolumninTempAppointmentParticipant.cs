using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.MSSQL.Migrations
{
    /// <inheritdoc />
    public partial class addcolumninTempAppointmentParticipant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeclinedAt",
                schema: "dbo",
                table: "TempAppointmentParticipants",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeclinedReason",
                schema: "dbo",
                table: "TempAppointmentParticipants",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeclinedAt",
                schema: "dbo",
                table: "TempAppointmentParticipants");

            migrationBuilder.DropColumn(
                name: "DeclinedReason",
                schema: "dbo",
                table: "TempAppointmentParticipants");
        }
    }
}
