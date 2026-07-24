using FlowPilot.Application.Common.Models;
using FlowPilot.Application.CRM.Model.Request.Task;
using FlowPilot.Application.CRM.Model.Response.Task;

namespace FlowPilot.Application.CRM;

public interface ITaskService : ITransientService
{
    Task<PaginationResponse<ViewTaskResponse>> SearchAsync(SearchTaskRequest request, CancellationToken cancellationToken = default);

    Task<ViewTaskResponse> GetByIdAsync(DefaultIdType id, CancellationToken cancellationToken = default);

    Task<CreateTaskResponse> CreateAsync(CreateTaskRequest request, CancellationToken cancellationToken = default);

    Task<string> UpdateAsync(DefaultIdType id, UpdateTaskRequest request, CancellationToken cancellationToken = default);

    Task<string> MarkCompletedAsync(DefaultIdType id, MarkTaskCompletedRequest request, CancellationToken cancellationToken = default);

    Task<string> DeleteAsync(DefaultIdType id, CancellationToken cancellationToken = default);
}
