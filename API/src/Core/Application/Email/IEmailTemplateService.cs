using FlowPilot.Application.Common.Models;
using FlowPilot.Application.Common.Models.Response;
using FlowPilot.Application.Email.Model.Request.EmailTemplate;
using FlowPilot.Application.Email.Model.Response.EmailTemplate;

namespace FlowPilot.Application.Email;
public interface IEmailTemplateService : ITransientService
{
    Task<CreateEmailTemplateResponse> CreateEmailTemplateAsync(CreateEmailTemplateRequest request);

    Task<PaginationResponse<ViewEmailTemplateResponse>> ViewEmailTemplateAsync(SearchEmailTemplateRequest request);

    Task<ViewEmailTemplateDetailResponse> GetEmailTemplateByIdAsync(DefaultIdType id);

    Task<string> UpdateEmailTemplateAsync(UpdateEmailTemplateRequest request);

    Task<string> DeleteEmailTemplateAsync(DefaultIdType id);

    Task<List<DropDownItemResponse>> GetEmailTemplatesForDropDownAsync(CancellationToken cancellationToken = default);
}
