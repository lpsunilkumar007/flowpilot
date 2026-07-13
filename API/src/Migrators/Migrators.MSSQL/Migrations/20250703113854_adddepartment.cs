using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Migrators.MSSQL.Migrations
{
    /// <inheritdoc />
    public partial class adddepartment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FormPageFieldOptions",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "FormPageFields",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "FormPages",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "FormStructures",
                schema: "dbo");

            migrationBuilder.CreateTable(
                name: "Departments",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DepartmentName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ParentDeptID = table.Column<int>(type: "int", nullable: true),
                    ParentDepartmentId = table.Column<int>(type: "int", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Departments_Departments_ParentDepartmentId",
                        column: x => x.ParentDepartmentId,
                        principalSchema: "dbo",
                        principalTable: "Departments",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Designations",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Designations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Levels",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Abbreviation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Levels", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Positions",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PositionTitle = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Positions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Salaries",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Basic = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    HRA = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Allowances = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Deductions = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    EffectiveFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Salaries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Employees",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DOJ = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DesignationID = table.Column<int>(type: "int", nullable: true),
                    PositionID = table.Column<int>(type: "int", nullable: true),
                    DepartmentID = table.Column<int>(type: "int", nullable: true),
                    ReportingManagerID = table.Column<int>(type: "int", nullable: true),
                    PAN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Aadhaar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SalaryID = table.Column<int>(type: "int", nullable: true),
                    LevelID = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Employees_Departments_DepartmentID",
                        column: x => x.DepartmentID,
                        principalSchema: "dbo",
                        principalTable: "Departments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Employees_Designations_DesignationID",
                        column: x => x.DesignationID,
                        principalSchema: "dbo",
                        principalTable: "Designations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Employees_Employees_ReportingManagerID",
                        column: x => x.ReportingManagerID,
                        principalSchema: "dbo",
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Employees_Levels_LevelID",
                        column: x => x.LevelID,
                        principalSchema: "dbo",
                        principalTable: "Levels",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Employees_Positions_PositionID",
                        column: x => x.PositionID,
                        principalSchema: "dbo",
                        principalTable: "Positions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Employees_Salaries_SalaryID",
                        column: x => x.SalaryID,
                        principalSchema: "dbo",
                        principalTable: "Salaries",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "HRDocuments",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeID = table.Column<int>(type: "int", nullable: false),
                    DocumentType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DocumentPath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UploadedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HRDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HRDocuments_Employees_EmployeeID",
                        column: x => x.EmployeeID,
                        principalSchema: "dbo",
                        principalTable: "Employees",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Departments_ParentDepartmentId",
                schema: "dbo",
                table: "Departments",
                column: "ParentDepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_DepartmentID",
                schema: "dbo",
                table: "Employees",
                column: "DepartmentID");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_DesignationID",
                schema: "dbo",
                table: "Employees",
                column: "DesignationID");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_LevelID",
                schema: "dbo",
                table: "Employees",
                column: "LevelID");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_PositionID",
                schema: "dbo",
                table: "Employees",
                column: "PositionID");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_ReportingManagerID",
                schema: "dbo",
                table: "Employees",
                column: "ReportingManagerID");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_SalaryID",
                schema: "dbo",
                table: "Employees",
                column: "SalaryID");

            migrationBuilder.CreateIndex(
                name: "IX_HRDocuments_EmployeeID",
                schema: "dbo",
                table: "HRDocuments",
                column: "EmployeeID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HRDocuments",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Employees",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Departments",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Designations",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Levels",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Positions",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Salaries",
                schema: "dbo");

            migrationBuilder.CreateTable(
                name: "FormStructures",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompletionMessage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FormStatus = table.Column<int>(type: "int", nullable: false),
                    FormStructureType = table.Column<int>(type: "int", nullable: false),
                    IntroScript = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IntroductionText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    UrlIdentifier = table.Column<string>(type: "nvarchar(max)", nullable: false)
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
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IntroScript = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IntroText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UrlIdentifier = table.Column<string>(type: "nvarchar(max)", nullable: false)
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
                name: "FormPageFields",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FKFormPageFieldPKId = table.Column<int>(type: "int", nullable: true),
                    FKFormPagePKId = table.Column<int>(type: "int", nullable: false),
                    Columns = table.Column<int>(type: "int", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CustomRegularExpression = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DateTimeType = table.Column<int>(type: "int", nullable: true),
                    DefaultValue = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescriptionExpression = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Disabled = table.Column<bool>(type: "bit", nullable: false),
                    DisabledExpression = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FileUploadCustomExtension = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FileUploadCustomValidationExtension = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FileUploadValidFileType = table.Column<int>(type: "int", nullable: true),
                    FormPageFieldType = table.Column<int>(type: "int", nullable: false),
                    HideExpression = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Label = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LabelExpression = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MaximumExpression = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MaximumLength = table.Column<int>(type: "int", nullable: true),
                    MinimumExpression = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MinimumLength = table.Column<int>(type: "int", nullable: true),
                    NumberDecimalDigits = table.Column<int>(type: "int", nullable: true),
                    Prefix = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PrefixExpression = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RowId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SelectDefaultValue = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Suffix = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SuffixExpression = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    ValidationPattern = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormPageFields", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormPageFields_FormPageFields_FKFormPageFieldPKId",
                        column: x => x.FKFormPageFieldPKId,
                        principalSchema: "dbo",
                        principalTable: "FormPageFields",
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
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    FKDeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FKLastModifiedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LastModifiedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false)
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
                name: "IX_FormPageFields_FKFormPageFieldPKId",
                schema: "dbo",
                table: "FormPageFields",
                column: "FKFormPageFieldPKId");

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
        }
    }
}
