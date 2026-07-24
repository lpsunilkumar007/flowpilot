using FlowPilot.Domain.Enums.CRM;

namespace FlowPilot.Application.CRM.Model.Response.Task;

public class ViewTaskResponse
{
    public DefaultIdType Id { get; set; }

    public Guid Uuid { get; set; }

    public string Title { get; set; } = string.Empty;

    public DateTimeOffset When { get; set; }

    public TaskBucket? Bucket { get; set; }

    public TaskType? Type { get; set; }

    public TaskPriority? Priority { get; set; }

    public bool IsCompleted { get; set; }

    public DateTimeOffset CreatedOn { get; set; }
}
