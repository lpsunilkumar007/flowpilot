using FlowPilot.Application.Common.Models;
using FlowPilot.Application.Email;
using FlowPilot.Application.Email.Model.Request;
using FlowPilot.Application.Email.Model.Response;
using FlowPilot.Host.Controllers.BaseControllers;

namespace FlowPilot.Host.Controllers.Email;
public class EmailLogController : VersionNeutralApiController
{

    public readonly IEmailLogService _emailLogService;

    public EmailLogController(IEmailLogService emailLogService)
    {
        _emailLogService = emailLogService;
    }

    /// <summary>
    /// Get email log  records by filter.
    /// </summary>
    /// <param name="request"></param>
    /// <returns></returns>
    [HttpPost("get-email-logs")]
    [MustHavePermission(SystemAction.View, SystemResource.EmailLog)]
    [OpenApiBodyParameter("Get all email-logs", "")]
    public Task<PaginationResponse<ViewEmailLogResponse>> GetEmailLogList(SearchEmailLogRequest request)
    {
        return _emailLogService.GetEmailLogAsync(request);
    }

    /// <summary>
    /// Get email log by id.
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [HttpGet("get-email-log/{id}")]
    [MustHavePermission(SystemAction.View, SystemResource.EmailLog)]
    [OpenApiOperation("Get email log by Id", "")]
    public Task<ViewEmailLogDetailResponse> GetEmailLogById(int id)
    {
        return _emailLogService.GetEmailLogByIdAsync(id);
    }
}
