using FlowPilot.Application.Common.Models;
using FlowPilot.Application.FormDesigner.Model.Request.FormStructure;
using FlowPilot.Application.FormDesigner.Model.Response.FormStructure;

namespace FlowPilot.Application.FormDesigner;
public interface IFormStructureService : ITransientService
{
    Task<CreateFormStructureResponse> CreateFormStructure(CreateFormStructureRequest request);

    Task<ViewFormStructureDetailResponse> GetFormStructureById(DefaultIdType id);

    Task<PaginationResponse<ViewFormStructureDetailResponse>> GetFormStructures(SearchFormStructureRequest request);

    Task<string> UpdateFormStructure(UpdateFormStructureRequest request);

    Task<string> DeleteFormStructure(DefaultIdType id);

}
