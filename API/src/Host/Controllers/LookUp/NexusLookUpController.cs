using FlowPilot.Application.Common.Models;
using FlowPilot.Application.Nexus.LookUp;
using FlowPilot.Host.Controllers.BaseControllers;
using FlowPilot.Application.Nexus.LookUp.Models.Response;
using FlowPilot.Application.Nexus.LookUp.Models.Request;

namespace FlowPilot.Host.Controllers.LookUp;

[Route("nexus-lookup")]
public class NexusLookUpController : VersionedApiController
{
    private readonly INexusLookUpService _nexusLookUpService;

    public NexusLookUpController(INexusLookUpService nexusLookUpService)
    {
        _nexusLookUpService = nexusLookUpService;
    }

    [HttpGet("get-look-ups")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageNexusLookUps)]
    [OpenApiOperation("Retrieve all look-ups", "")]
    public async Task<List<ViewNexusLookUpsResponse>> GetLookUpCodes()
    {
        return await _nexusLookUpService.GetLookUpCodesAsync();
    }

    [HttpPost("get-look-up-values")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageNexusLookUps)]
    [OpenApiOperation("Retrieve look-up values", "")]
    public async Task<PaginationResponse<ViewNexusLookUpCodeValuesResponse>> GetLookUpCodeValues(SearchNexusLookUpCodeValuesRequest request)
    {
        return await _nexusLookUpService.GetLookUpCodeValuesAsync(request);
    }

    [HttpPost("create-look-up-value")]
    [MustHavePermission(SystemAction.Create, SystemResource.ManageNexusLookUps)]
    [OpenApiOperation("Create a new item for look-up", "")]
    public async Task<string> CreateLookUpCodeValue(CreateNexusLookUpCodeValueRequest request)
    {
        return await _nexusLookUpService.CreateLookUpCodeValueAsync(request);
    }

    [HttpGet("get-look-up-value/{id}")]
    [OpenApiOperation("Get look-up value by id", "")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageNexusLookUps)]
    public async Task<ViewNexusLookUpCodeValuesResponse> GetLookUpCodeValueById(int id)
    {
        return await _nexusLookUpService.GetLookUpCodeValueByIdAsync(id);
    }

    [HttpPut("update-look-up-value")]
    [OpenApiOperation("Update look-up value", "")]
    [MustHavePermission(SystemAction.Update, SystemResource.ManageNexusLookUps)]
    public async Task<string> UpdateLookUpCodeValue(UpdateNexusLookUpCodeValueRequest request)
    {
        return await _nexusLookUpService.UpdateLookUpCodeValueAsync(request);
    }
}
