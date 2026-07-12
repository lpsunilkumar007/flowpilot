using FlowPilot.Application.Common.Models;
using FlowPilot.Application.FormDesigner.Model.Request.FormPageTabs;
using FlowPilot.Application.FormDesigner.Model.Response.FormPageTabs;

namespace FlowPilot.Application.FormDesigner;
public interface IFormPageTabService : ITransientService
{
    Task<CreateFormPageTabResponse> CreateFormPageTab(CreateFormPageTabRequest request);

    Task<ViewFormPageTabDetailResponse> GetFormPageTabById(DefaultIdType id);

    Task<PaginationResponse<ViewFormPageTabDetailResponse>> GetFormPageTabs(SearchFormPageTabRequest request);

    Task<string> UpdateFormPageTab(UpdateFormPageTabRequest request);

    Task<string> DeleteFormPagTab(DefaultIdType id);
}
