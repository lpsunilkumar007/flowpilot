using FlowPilot.Application.Common.Models;
using FlowPilot.Application.CRM;
using FlowPilot.Application.CRM.Model.Request.Task;
using FlowPilot.Application.CRM.Model.Response.Task;
using FlowPilot.Host.Controllers.BaseControllers;

namespace FlowPilot.Host.Controllers.CRM;

public class TaskController : VersionedApiController
{
    private readonly ITaskService _taskService;

    public TaskController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet]
    [RequireAnyResource(SystemAction.View, [SystemResource.ManageTasks, SystemResource.ManageLeadCalendar])]
    [OpenApiOperation("Search tasks", "")]
    public async Task<PaginationResponse<ViewTaskResponse>> Search([FromQuery] SearchTaskRequest request, CancellationToken cancellationToken)
    {
        return await _taskService.SearchAsync(request, cancellationToken);
    }

    [HttpGet("{id}")]
    [RequireAnyResource(SystemAction.View, [SystemResource.ManageTasks, SystemResource.ManageLeadCalendar])]
    [OpenApiOperation("Get task by id", "")]
    public async Task<ViewTaskResponse> GetById(DefaultIdType id, CancellationToken cancellationToken)
    {
        return await _taskService.GetByIdAsync(id, cancellationToken);
    }

    [HttpPost]
    [MustHavePermission(SystemAction.Create, SystemResource.ManageTasks)]
    [OpenApiOperation("Create a new task", "")]
    public async Task<CreateTaskResponse> Create(CreateTaskRequest request, CancellationToken cancellationToken)
    {
        return await _taskService.CreateAsync(request, cancellationToken);
    }

    [HttpPut("{id}")]
    [RequireAnyResource(SystemAction.Update, [SystemResource.ManageTasks, SystemResource.ManageLeadCalendar])]
    [OpenApiOperation("Update task", "")]
    public async Task<string> Update(DefaultIdType id, UpdateTaskRequest request, CancellationToken cancellationToken)
    {
        return await _taskService.UpdateAsync(id, request, cancellationToken);
    }

    [HttpPost("{id}/completed")]
    [RequireAnyResource(SystemAction.Update, [SystemResource.ManageTasks, SystemResource.ManageLeadCalendar])]
    [OpenApiOperation("Mark task completed", "")]
    public async Task<string> MarkCompleted(DefaultIdType id, MarkTaskCompletedRequest request, CancellationToken cancellationToken)
    {
        return await _taskService.MarkCompletedAsync(id, request, cancellationToken);
    }

    [HttpDelete("{id}")]
    [MustHavePermission(SystemAction.Delete, SystemResource.ManageTasks)]
    [OpenApiOperation("Delete task", "")]
    public async Task<string> Delete(DefaultIdType id, CancellationToken cancellationToken)
    {
        return await _taskService.DeleteAsync(id, cancellationToken);
    }
}
