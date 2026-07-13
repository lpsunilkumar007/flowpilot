using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.MSSQL.Migrations
{
    /// <inheritdoc />
    public partial class tableupdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "AppointmentUrl",
                schema: "dbo",
                table: "AppointmentParticipant",
                newName: "ThirdPartyAppointmentUrl");

            migrationBuilder.AddColumn<string>(
                name: "UrlIdentifier",
                schema: "dbo",
                table: "TempAppointmentParticipants",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "SettingValues",
                schema: "dbo",
                table: "Settings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UrlIdentifier",
                schema: "dbo",
                table: "AppointmentParticipant",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UrlIdentifier",
                schema: "dbo",
                table: "TempAppointmentParticipants");

            migrationBuilder.DropColumn(
                name: "UrlIdentifier",
                schema: "dbo",
                table: "AppointmentParticipant");

            migrationBuilder.RenameColumn(
                name: "ThirdPartyAppointmentUrl",
                schema: "dbo",
                table: "AppointmentParticipant",
                newName: "AppointmentUrl");

            migrationBuilder.AlterColumn<string>(
                name: "SettingValues",
                schema: "dbo",
                table: "Settings",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");
        }
    }
}
