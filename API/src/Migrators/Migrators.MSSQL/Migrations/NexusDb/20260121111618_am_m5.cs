using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.MSSQL.Migrations.NexusDb
{
    /// <inheritdoc />
    public partial class am_m5 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ApplicationUserTwoFactorSession",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FKApplicationUserPKId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Provider = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpiresAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Attempts = table.Column<int>(type: "int", nullable: false),
                    Used = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_ApplicationUserTwoFactorSession", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApplicationUserTwoFactorSession_AspNetUsers_FKApplicationUserPKId",
                        column: x => x.FKApplicationUserPKId,
                        principalSchema: "dbo",
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationUserTwoFactorSession_FKApplicationUserPKId",
                schema: "dbo",
                table: "ApplicationUserTwoFactorSession",
                column: "FKApplicationUserPKId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApplicationUserTwoFactorSession",
                schema: "dbo");
        }
    }
}
