using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.MSSQL.Migrations.NexusDb
{
    /// <inheritdoc />
    public partial class m10_am : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "HostedInvoiceUrl",
                schema: "dbo",
                table: "TenantSubscriptionPlanInvoices",
                newName: "StripeInvoiceUrl");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "StripeInvoiceUrl",
                schema: "dbo",
                table: "TenantSubscriptionPlanInvoices",
                newName: "HostedInvoiceUrl");
        }
    }
}
