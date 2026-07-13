using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.MSSQL.Migrations
{
    /// <inheritdoc />
    public partial class u_m4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsTestModeEnabled",
                schema: "dbo",
                table: "EmailLog",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SendGridMessageId",
                schema: "dbo",
                table: "EmailLog",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsTestModeEnabled",
                schema: "dbo",
                table: "EmailLog");

            migrationBuilder.DropColumn(
                name: "SendGridMessageId",
                schema: "dbo",
                table: "EmailLog");
        }
    }
}
