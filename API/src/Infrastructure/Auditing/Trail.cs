using FlowPilot.Domain.Common.Contracts;
using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Infrastructure.Auditing;

public class Trail : BaseEntity
{
    public string? Type { get; set; }
    public string? TableName { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? AffectedColumns { get; set; }
    public string? PrimaryKey { get; set; }
    public Guid CreatedBy { get; set; }
    public required int TenantId { get; set; }
    public DateTimeOffset CreatedOn { get; set; }
}
