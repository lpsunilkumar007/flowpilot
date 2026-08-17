using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.PostgreSQL.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class CRM_OfferingGuidAndOptionalAssignee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "UniqueId",
                schema: "dbo",
                table: "Offerings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<string>(
                name: "FKAssignedToUserId",
                schema: "dbo",
                table: "Leads",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "ToUserId",
                schema: "dbo",
                table: "LeadAssignmentHistories",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateIndex(
                name: "IX_Offerings_UniqueId",
                schema: "dbo",
                table: "Offerings",
                column: "UniqueId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Offerings_UniqueId",
                schema: "dbo",
                table: "Offerings");

            migrationBuilder.DropColumn(
                name: "UniqueId",
                schema: "dbo",
                table: "Offerings");

            migrationBuilder.AlterColumn<string>(
                name: "FKAssignedToUserId",
                schema: "dbo",
                table: "Leads",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ToUserId",
                schema: "dbo",
                table: "LeadAssignmentHistories",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
