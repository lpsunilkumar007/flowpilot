using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.MSSQL.Migrations
{
    /// <inheritdoc />
    public partial class am_m22 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EmailBccUserIds",
                schema: "dbo",
                table: "EmailLog",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmailCcUserIds",
                schema: "dbo",
                table: "EmailLog",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmailBccUserIds",
                schema: "dbo",
                table: "EmailLog");

            migrationBuilder.DropColumn(
                name: "EmailCcUserIds",
                schema: "dbo",
                table: "EmailLog");
        }
    }
}
