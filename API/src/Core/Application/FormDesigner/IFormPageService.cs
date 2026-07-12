using FlowPilot.Application.Common.Models;
using FlowPilot.Application.FormDesigner.Model.Request.FormPages;
using FlowPilot.Application.FormDesigner.Model.Response.FormPages;

namespace FlowPilot.Application.FormDesigner;
public interface IFormPageService : ITransientService
{
    Task<CreateFormPageResponse> CreateFormPage(CreateFormPageRequest request);

    Task<ViewFormPageDetailResponse> GetFormPageById(DefaultIdType id);

    Task<PaginationResponse<ViewFormPageDetailResponse>> GetFormPages(SearchFormPageRequest request);

    Task<string> UpdateFormPage(UpdateFormPageRequest request);

    Task<string> DeleteFormPage(DefaultIdType id);
}
