using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.MSSQL.Migrations.NexusDb
{
    /// <inheritdoc />
    public partial class m9_am : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HostedInvoiceUrl",
                schema: "dbo",
                table: "TenantSubscriptionPlanInvoices",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HostedInvoiceUrl",
                schema: "dbo",
                table: "TenantSubscriptionPlanInvoices");
        }
    }
}
