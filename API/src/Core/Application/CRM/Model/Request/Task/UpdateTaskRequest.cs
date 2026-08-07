using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.CRM;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.CRM.Model.Request.Task;

public class UpdateTaskRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DefaultIdType Id { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string Title { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset When { get; set; }

    public TaskBucket? Bucket { get; set; }

    public TaskType? Type { get; set; }

    public TaskPriority? Priority { get; set; }
}
