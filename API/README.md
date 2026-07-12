How to Add Migration

Default Project "Migrators.MSSQL" OR "Migrators.PostgreSQL"

For "NexusDbContext"
- Add-Migration <<Name>> -Context NexusDbContext
- Update-Database -Context NexusDbContext

For "AuditingDbContext"
- Add-Migration <<Name>> -Context AuditingDbContext
- Update-Database -Context AuditingDbContext

For "ApplicationDbContext"
- Add-Migration <<Name>> -Context ApplicationDbContext
- Update-Database -Context ApplicationDbContext