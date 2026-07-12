using FlowPilot.Application.Common.Models;
using FlowPilot.Application.Common.Models.Response;
using FlowPilot.Application.LookUp.Models.Request;
using FlowPilot.Application.LookUp.Models.Response;

namespace FlowPilot.Application.LookUp;
public interface ILookUpService : ITransientService
{
    Task<List<ViewLookUpsResponse>> GetLookUpCodesAsync();

    Task<PaginationResponse<ViewLookUpCodeValuesResponse>> GetLookUpCodeValuesAsync(SearchLookUpCodeValuesRequest request);

    Task<List<DropDownItemResponse>> GetLookUpCodeValuesByTypeAsync(LookUpCodeTypes type);

    Task<string> CreateLookUpCodeValueAsync(CreateLookUpCodeValueRequest request);

    Task<string> UpdateLookUpCodeValueAsync(UpdateLookUpCodeValueRequest request);

    Task<ViewLookUpCodeValuesResponse> GetLookUpCodeValueByIdAsync(int id);
}
