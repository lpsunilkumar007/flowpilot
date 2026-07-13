using FlowPilot.Application.Common.Models;
using FlowPilot.Application.Email;
using FlowPilot.Application.Email.Model.Request.EmailTemplate;
using FlowPilot.Application.Email.Model.Response.EmailTemplate;
using FlowPilot.Host.Controllers.BaseControllers;

namespace FlowPilot.Host.Controllers.Email;

public class EmailTemplateController : VersionNeutralApiController
{
    public IEmailTemplateService _emailTemplateService;

    public EmailTemplateController(IEmailTemplateService emailTemplateService)
    {
        _emailTemplateService = emailTemplateService;
    }

    [HttpPost("create-email-template")]
    [MustHavePermission(SystemAction.Create, SystemResource.EmailTemplates)]
    [OpenApiOperation("Create a new email template", "")]
    public async Task<CreateEmailTemplateResponse> CreateEmailTemplate(CreateEmailTemplateRequest request)
    {
        return await _emailTemplateService.CreateEmailTemplateAsync(request);
    }

    [HttpGet("get-email-template/{id}")]
    [OpenApiOperation("Get email template by id", "")]
    [MustHavePermission(SystemAction.View, SystemResource.EmailTemplates)]
    public async Task<ViewEmailTemplateDetailResponse> GetEmailTemplateById(DefaultIdType id)
    {
        return await _emailTemplateService.GetEmailTemplateByIdAsync(id);
    }

    [HttpPut("update-email-template")]
    [OpenApiOperation("Update email template details", "")]
    [MustHavePermission(SystemAction.Update, SystemResource.EmailTemplates)]
    public async Task<string> UpdateEmailTemplate(UpdateEmailTemplateRequest request)
    {
        return await _emailTemplateService.UpdateEmailTemplateAsync(request);
    }

    [HttpPost("get-email-templates")]
    [MustHavePermission(SystemAction.View, SystemResource.EmailTemplates)]
    [OpenApiOperation("Retrieve all email templates", "")]
    public async Task<PaginationResponse<ViewEmailTemplateResponse>> GetEmailTemplates(SearchEmailTemplateRequest request)
    {
        return await _emailTemplateService.ViewEmailTemplateAsync(request);
    }

    [HttpDelete("delete-email-templateyer/{id}")]
    [MustHavePermission(SystemAction.Delete, SystemResource.EmailTemplates)]
    [OpenApiOperation("Delete email-template ", "")]
    public async Task<string> DeleteEmailTemplate(DefaultIdType id)
    {
        return await _emailTemplateService.DeleteEmailTemplateAsync(id);
    }
}
