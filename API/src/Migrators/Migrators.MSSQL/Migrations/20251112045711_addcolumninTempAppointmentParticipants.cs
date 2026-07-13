using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.MSSQL.Migrations
{
    /// <inheritdoc />
    public partial class addcolumninTempAppointmentParticipants : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ApproveAtDate",
                schema: "dbo",
                table: "TempAppointmentParticipants",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ApproveEndAtTime",
                schema: "dbo",
                table: "TempAppointmentParticipants",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApproveAtDate",
                schema: "dbo",
                table: "TempAppointmentParticipants");

            migrationBuilder.DropColumn(
                name: "ApproveEndAtTime",
                schema: "dbo",
                table: "TempAppointmentParticipants");
        }
    }
}
