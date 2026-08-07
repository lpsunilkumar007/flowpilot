using FlowPilot.Application.Common.Models;
using FlowPilot.Application.GoogleMap;
using FlowPilot.Application.GoogleMap.Request;
using FlowPilot.Application.LookUp;
using FlowPilot.Application.LookUp.Models.Request;
using FlowPilot.Application.LookUp.Models.Response;
using FlowPilot.Host.Controllers.BaseControllers;

namespace FlowPilot.Host.Controllers.LookUp;

public class LookUpController : VersionedApiController
{
    public readonly ILookUpService _lookUpService;
    public readonly IGoogleMapService _googleMapService;

    public LookUpController(ILookUpService lookUpService, IGoogleMapService googleMapService)
    {
        _lookUpService = lookUpService;
        _googleMapService = googleMapService;
    }

    [HttpGet("get-look-ups")]
    [RequireAnyResource(SystemAction.View, [SystemResource.ManageLookUps, SystemResource.ManageSalePipelines, SystemResource.ManageLeads])]
    [OpenApiOperation("Retrieve all look-ups", "")]
    public async Task<List<ViewLookUpsResponse>> GetLookUpCodes()
    {
        return await _lookUpService.GetLookUpCodesAsync();
    }

    [HttpPost("get-look-up-values")]
    [RequireAnyResource(SystemAction.View, [SystemResource.ManageLookUps, SystemResource.ManageSalePipelines, SystemResource.ManageLeads])]
    [OpenApiOperation("Retrieve look-up values", "")]
    public async Task<PaginationResponse<ViewLookUpCodeValuesResponse>> GetLookUpCodeValues(SearchLookUpCodeValuesRequest request)
    {
        return await _lookUpService.GetLookUpCodeValuesAsync(request);
    }

    [HttpPost("create-look-up-value")]
    [MustHavePermission(SystemAction.Create, SystemResource.ManageLookUps)]
    [OpenApiOperation("Create a new item for look-up", "")]
    public async Task<string> CreateLookUpCodeValue(CreateLookUpCodeValueRequest request)
    {
        return await _lookUpService.CreateLookUpCodeValueAsync(request);
    }

    [HttpGet("get-look-up-value/{id}")]
    [OpenApiOperation("Get look-up value by id", "")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageLookUps)]
    public async Task<ViewLookUpCodeValuesResponse> GetLookUpCodeValueById(int id)
    {
        return await _lookUpService.GetLookUpCodeValueByIdAsync(id);
    }

    [HttpPut("update-look-up-value")]
    [OpenApiOperation("Update look-up value", "")]
    [MustHavePermission(SystemAction.Update, SystemResource.ManageLookUps)]
    public async Task<string> UpdateLookUpCodeValue(UpdateLookUpCodeValueRequest request)
    {
        return await _lookUpService.UpdateLookUpCodeValueAsync(request);
    }

    [HttpGet("address-autofill")]
    [OpenApiOperation("Get address autocomplete suggestions", "")]
    public async Task<List<DropDownStrValuePlaceResponse>> GetAddressSuggestions([FromQuery] string input)
    {
        return await _googleMapService.GetAddressSuggestionsAsync(input);
    }
}
