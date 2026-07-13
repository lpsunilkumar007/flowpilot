using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.MSSQL.Migrations
{
    /// <inheritdoc />
    public partial class am_m4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FormStructures",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FormStatus = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IntroductionText = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_FormStructures", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FormPages",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FKFormStructurePKId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IntroText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_FormPages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormPages_FormStructures_FKFormStructurePKId",
                        column: x => x.FKFormStructurePKId,
                        principalSchema: "dbo",
                        principalTable: "FormStructures",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "FormPageTabs",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FKFormPagePKId = table.Column<int>(type: "int", nullable: false),
                    FKFormPageTabPKId = table.Column<int>(type: "int", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_FormPageTabs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormPageTabs_FormPageTabs_FKFormPageTabPKId",
                        column: x => x.FKFormPageTabPKId,
                        principalSchema: "dbo",
                        principalTable: "FormPageTabs",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FormPageTabs_FormPages_FKFormPagePKId",
                        column: x => x.FKFormPagePKId,
                        principalSchema: "dbo",
                        principalTable: "FormPages",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "FormPageFields",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FKFormPagePKId = table.Column<int>(type: "int", nullable: false),
                    FKFormPageFieldTabId = table.Column<int>(type: "int", nullable: true),
                    FormPageFieldType = table.Column<int>(type: "int", nullable: false),
                    Label = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FieldKey = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsAdditionalCommentAllowed = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_FormPageFields", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormPageFields_FormPageTabs_FKFormPageFieldTabId",
                        column: x => x.FKFormPageFieldTabId,
                        principalSchema: "dbo",
                        principalTable: "FormPageTabs",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FormPageFields_FormPages_FKFormPagePKId",
                        column: x => x.FKFormPagePKId,
                        principalSchema: "dbo",
                        principalTable: "FormPages",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "FormPageFieldOptions",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FKFormPageFieldPKId = table.Column<int>(type: "int", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_FormPageFieldOptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormPageFieldOptions_FormPageFields_FKFormPageFieldPKId",
                        column: x => x.FKFormPageFieldPKId,
                        principalSchema: "dbo",
                        principalTable: "FormPageFields",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_FormPageFieldOptions_FKFormPageFieldPKId",
                schema: "dbo",
                table: "FormPageFieldOptions",
                column: "FKFormPageFieldPKId");

            migrationBuilder.CreateIndex(
                name: "IX_FormPageFields_FKFormPageFieldTabId",
                schema: "dbo",
                table: "FormPageFields",
                column: "FKFormPageFieldTabId");

            migrationBuilder.CreateIndex(
                name: "IX_FormPageFields_FKFormPagePKId",
                schema: "dbo",
                table: "FormPageFields",
                column: "FKFormPagePKId");

            migrationBuilder.CreateIndex(
                name: "IX_FormPages_FKFormStructurePKId",
                schema: "dbo",
                table: "FormPages",
                column: "FKFormStructurePKId");

            migrationBuilder.CreateIndex(
                name: "IX_FormPageTabs_FKFormPagePKId",
                schema: "dbo",
                table: "FormPageTabs",
                column: "FKFormPagePKId");

            migrationBuilder.CreateIndex(
                name: "IX_FormPageTabs_FKFormPageTabPKId",
                schema: "dbo",
                table: "FormPageTabs",
                column: "FKFormPageTabPKId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FormPageFieldOptions",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "FormPageFields",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "FormPageTabs",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "FormPages",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "FormStructures",
                schema: "dbo");
        }
    }
}
