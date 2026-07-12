using FlowPilot.Application.Common.Models;
using FlowPilot.Application.Email.Model.Request;
using FlowPilot.Application.Email.Model.Response;
using FlowPilot.Domain.Email;

namespace FlowPilot.Application.Email;
public interface IEmailLogService : ITransientService
{
    Task AddEmailLogAsync(EmailLog emailLog);
    Task<ViewEmailLogDetailResponse> GetEmailLogByIdAsync(int id);
    Task<PaginationResponse<ViewEmailLogResponse>> GetEmailLogAsync(SearchEmailLogRequest request);
}
