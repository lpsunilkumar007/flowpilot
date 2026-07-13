using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.MSSQL.Migrations
{
    /// <inheritdoc />
    public partial class updateTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CancellationReason",
                schema: "dbo",
                table: "TempAppointments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FKCancelledByApplicationUserPKId",
                schema: "dbo",
                table: "TempAppointments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FKTempAppointmentPkId",
                schema: "dbo",
                table: "TempAppointments",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TempAppointments_FKTempAppointmentPkId",
                schema: "dbo",
                table: "TempAppointments",
                column: "FKTempAppointmentPkId");

            migrationBuilder.AddForeignKey(
                name: "FK_TempAppointments_TempAppointments_FKTempAppointmentPkId",
                schema: "dbo",
                table: "TempAppointments",
                column: "FKTempAppointmentPkId",
                principalSchema: "dbo",
                principalTable: "TempAppointments",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TempAppointments_TempAppointments_FKTempAppointmentPkId",
                schema: "dbo",
                table: "TempAppointments");

            migrationBuilder.DropIndex(
                name: "IX_TempAppointments_FKTempAppointmentPkId",
                schema: "dbo",
                table: "TempAppointments");

            migrationBuilder.DropColumn(
                name: "CancellationReason",
                schema: "dbo",
                table: "TempAppointments");

            migrationBuilder.DropColumn(
                name: "FKCancelledByApplicationUserPKId",
                schema: "dbo",
                table: "TempAppointments");

            migrationBuilder.DropColumn(
                name: "FKTempAppointmentPkId",
                schema: "dbo",
                table: "TempAppointments");
        }
    }
}
