using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.MSSQL.Migrations
{
    /// <inheritdoc />
    public partial class CRM_Offerings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Offerings",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FKOwnerUserId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpectedValueFrom = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ExpectedValueTo = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DeletedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Offerings", x => x.Id);
                });

            migrationBuilder.AddColumn<int>(
                name: "FKOfferingId",
                schema: "dbo",
                table: "Leads",
                type: "int",
                nullable: true);

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

            migrationBuilder.DropIndex(
                name: "IX_Leads_FKOfferingId",
                schema: "dbo",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "FKOfferingId",
                schema: "dbo",
                table: "Leads");

            migrationBuilder.DropTable(
                name: "Offerings",
                schema: "dbo");
        }
    }
}
