using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.MSSQL.Migrations
{
    /// <inheritdoc />
    public partial class updatecolumninTempAppointmentParticipants : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ApproveEndAtTime",
                schema: "dbo",
                table: "TempAppointmentParticipants",
                newName: "ApproveAtTime");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ApproveAtTime",
                schema: "dbo",
                table: "TempAppointmentParticipants",
                newName: "ApproveEndAtTime");
        }
    }
}
