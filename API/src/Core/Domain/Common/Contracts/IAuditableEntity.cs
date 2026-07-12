namespace FlowPilot.Domain.Common.Contracts;

public interface IAuditableEntity
{
    public Guid CreatedBy { get; set; }
    public DateTimeOffset CreatedOn { get; set; }
    public Guid? FKLastModifiedBy { get; set; }
    public DateTimeOffset? LastModifiedOn { get; set; }
    public int TenantId { get; set; }
}
