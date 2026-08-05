using FlowPilot.Application.Common.Models;
using FlowPilot.Domain.Enums.CRM;

namespace FlowPilot.Application.CRM.Model.Request.Task;

public class SearchTaskRequest : SearchRequestBaseClass
{
    public string? SearchText { get; set; }

    public TaskBucket? Bucket { get; set; }

    public TaskType? Type { get; set; }

    public TaskPriority? Priority { get; set; }

    /// <summary>When set, returns tasks created by this user (subject to reporting hierarchy).</summary>
    public string? CreatedByUserId { get; set; }
}
