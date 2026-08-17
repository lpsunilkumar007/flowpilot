using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Migrators.PostgreSQL.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class TempPendingOfferingCheck2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FKOfferingId",
                schema: "dbo",
                table: "Leads",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Offerings",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    FKOwnerUserId = table.Column<string>(type: "text", nullable: false),
                    ExpectedValueFrom = table.Column<decimal>(type: "numeric", nullable: true),
                    ExpectedValueTo = table.Column<decimal>(type: "numeric", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Offerings", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Leads_FKOfferingId",
                schema: "dbo",
                table: "Leads",
                column: "FKOfferingId");

            migrationBuilder.AddForeignKey(
                name: "FK_Leads_Offerings_FKOfferingId",
                schema: "dbo",
                table: "Leads",
                column: "FKOfferingId",
                principalSchema: "dbo",
                principalTable: "Offerings",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Leads_Offerings_FKOfferingId",
                schema: "dbo",
                table: "Leads");

            migrationBuilder.DropTable(
                name: "Offerings",
                schema: "dbo");

            migrationBuilder.DropIndex(
                name: "IX_Leads_FKOfferingId",
                schema: "dbo",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "FKOfferingId",
                schema: "dbo",
                table: "Leads");
        }
    }
}
