using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Migrators.PostgreSQL.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class CRM_Campaigns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Campaigns",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    CampaignType = table.Column<int>(type: "integer", nullable: false),
                    TemplateId = table.Column<int>(type: "integer", nullable: false),
                    ScheduleDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_Campaigns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Campaigns_EmailTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalSchema: "dbo",
                        principalTable: "EmailTemplates",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CampaignUsers",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CampaignId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Contact = table.Column<string>(type: "text", nullable: false),
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
                    table.PrimaryKey("PK_CampaignUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CampaignUsers_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalSchema: "dbo",
                        principalTable: "Campaigns",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_TemplateId",
                schema: "dbo",
                table: "Campaigns",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_CampaignUsers_CampaignId_UserId",
                schema: "dbo",
                table: "CampaignUsers",
                columns: new[] { "CampaignId", "UserId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CampaignUsers",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Campaigns",
                schema: "dbo");
        }
    }
}
