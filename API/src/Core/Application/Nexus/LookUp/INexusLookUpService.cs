using FlowPilot.Application.Common.Models;
using FlowPilot.Application.Common.Models.Response;
using FlowPilot.Domain.Enums.Nexus;
using FlowPilot.Application.Nexus.LookUp.Models.Request;
using FlowPilot.Application.Nexus.LookUp.Models.Response;

namespace FlowPilot.Application.Nexus.LookUp;
public interface INexusLookUpService : ITransientService
{
    Task<List<DropDownItemResponse>> GetNexusLookUpValuesByCodeForDropDownAsync(NexusLookUpCodeTypes type);

    Task<List<ViewNexusLookUpsResponse>> GetLookUpCodesAsync();

    Task<PaginationResponse<ViewNexusLookUpCodeValuesResponse>> GetLookUpCodeValuesAsync(SearchNexusLookUpCodeValuesRequest request);

    Task<string> CreateLookUpCodeValueAsync(CreateNexusLookUpCodeValueRequest request);

    Task<string> UpdateLookUpCodeValueAsync(UpdateNexusLookUpCodeValueRequest request);

    Task<ViewNexusLookUpCodeValuesResponse> GetLookUpCodeValueByIdAsync(int id);

    Task<ViewNexusLookUpCodeValuesResponse> GetLookUpCodeDefaultValueByCode(NexusLookUpCodeTypes type);
}
