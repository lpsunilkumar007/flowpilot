using FlowPilot.Application.Common.Models;
using FlowPilot.Application.Nexus.Localization;
using FlowPilot.Application.Nexus.Localization.Models.Request;
using FlowPilot.Application.Nexus.Localization.Models.Response;
using FlowPilot.Host.Controllers.BaseControllers;

namespace FlowPilot.Host.Controllers.Localization;

public class LocalizationController : VersionNeutralApiController
{
    public readonly ILocalizationService _localizationService;

    public LocalizationController(ILocalizationService localizationService)
    {
        _localizationService = localizationService;
    }

    [HttpPost("create-country")]
    [MustHavePermission(SystemAction.Create, SystemResource.CountryLocalization)]
    [OpenApiOperation("Create a new country ", "")]
    public async Task<CreateCountryResponse> CreateCountry(CreateCountryRequest request)
    {
        return await _localizationService.CreateCountryAsync(request);
    }

    [HttpGet("get-countries")]
    [MustHavePermission(SystemAction.View, SystemResource.CountryLocalization)]
    [OpenApiOperation("Get all country", "")]
    public Task<List<ViewCountryResponse>> GetCountry()
    {
        return _localizationService.GetCountryAsync();
    }

    [HttpGet("get-country-id/{id}")]
    [MustHavePermission(SystemAction.View, SystemResource.CountryLocalization)]
    [OpenApiOperation("Get a country by Id", "")]
    public Task<ViewCountryResponse> GetCountryById(DefaultIdType id)
    {
        return _localizationService.GetCountryByIdAsync(id);
    }

    [HttpPut("update-country")]
    [MustHavePermission(SystemAction.Update, SystemResource.CountryLocalization)]
    [OpenApiOperation("Update a country by Id", "")]
    public Task<string> UpdateCountry(UpdateCountryRequest request)
    {
        return _localizationService.UpdateCountryAsync(request);
    }

    [HttpDelete("delete-country/{countryId}")]
    [MustHavePermission(SystemAction.Delete, SystemResource.CountryLocalization)]
    [OpenApiOperation("Delete a country", "")]
    public Task<string> DeleteCountry(DefaultIdType countryId)
    {
        return _localizationService.DeleteCountryAsync(countryId);
    }

    [HttpPost("create-localization-for-country")]
    [MustHavePermission(SystemAction.Create, SystemResource.CountryLocalization)]
    [OpenApiOperation("Create a localization for country ", "")]
    public async Task<CreateCountryLocalizationResponse> CreateCountryLocalization(CreateCountryLocalizationRequest request)
    {
        return await _localizationService.CreateCountryLocalizationAsync(request);
    }

    [HttpPost("get-localizations-by-country")]
    [OpenApiOperation("Get a localization for selected country ", "")]
    [MustHavePermission(SystemAction.View, SystemResource.CountryLocalization)]
    public async Task<PaginationResponse<ViewCountryLocalizationResponse>> GetCountryLocalization(SearchCountryLocalizationRequest request)
    {
        return await _localizationService.GetCountryLocalizationAsync(request);
    }

    [HttpGet("get-localization-by-country-id/{id}")]
    [MustHavePermission(SystemAction.View, SystemResource.CountryLocalization)]
    [OpenApiOperation("Get a localization by country Id", "")]
    public Task<ViewCountryLocalizationResponse> GetCountryLocalizationById(DefaultIdType id)
    {
        return _localizationService.GetCountryLocalizationByIdAsync(id);
    }

    [HttpPost("update-localization")]
    [MustHavePermission(SystemAction.Update, SystemResource.CountryLocalization)]
    [OpenApiOperation("Update a localization by country Id", "")]
    public Task<string> UpdateCountryLocalization (UpdateCountryLocalizationRequest request)
    {
        return _localizationService.UpdateCountryLocalizationAsync(request);
    }
}
