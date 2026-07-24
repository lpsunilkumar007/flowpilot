using FlowPilot.Domain.Enums.CRM;

namespace FlowPilot.Domain.CRM;

public class Tasks : AuditableEntity
{
    public Guid Uuid { get; set; }

    public required string Title { get; set; }

    public required DateTimeOffset When { get; set; }

    public TaskBucket? Bucket { get; set; }

    public TaskType? Type { get; set; }

    public TaskPriority? Priority { get; set; }

    public bool IsCompleted { get; set; }
}
