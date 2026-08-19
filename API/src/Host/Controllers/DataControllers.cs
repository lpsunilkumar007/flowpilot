using FlowPilot.Application.Common.Models.Response;
using FlowPilot.Application.CRM;
using FlowPilot.Application.CRM.Model.Response.Offering;
using FlowPilot.Application.LookUp;
using FlowPilot.Application.Nexus.Identity.Users;
using FlowPilot.Application.Nexus.Localization;
using FlowPilot.Application.Nexus.Localization.Models.Response;
using FlowPilot.Application.Nexus.LookUp;
using FlowPilot.Domain.Enums;
using FlowPilot.Domain.Enums.Nexus;
using FlowPilot.Host.Controllers.BaseControllers;

namespace FlowPilot.Host.Controllers;

public class DataControllers : VersionNeutralApiController
{
    private readonly ILookUpService _lookUpService;
    private readonly INexusLookUpService _nexusLookUpService;
    private readonly IUserService _userService;
    private readonly ILocalizationService _localizationService;
    private readonly IOfferingService _offeringService;

    public DataControllers(
        ILookUpService lookUpService,
        INexusLookUpService nexusLookUpService,
        IUserService userService,
        ILocalizationService localizationService,
        IOfferingService offeringService)
    {
        _lookUpService = lookUpService;
        _nexusLookUpService = nexusLookUpService;
        _userService = userService;
        _localizationService = localizationService;
        _offeringService = offeringService;
    }

    [HttpPost("drp-get-look-up-values")]
    [OpenApiOperation("Retrieve look-up values for drop-down by type", "")]
    public async Task<List<DropDownItemResponse>> GetLookUpCodeValues(LookUpCodeTypes type)
    {
        return await _lookUpService.GetLookUpCodeValuesByTypeAsync(type);
    }

    [HttpPost("drp-nexus-get-look-up-values")]
    [OpenApiOperation("Retrieve look-up values for drop-down by type", "")]
    public async Task<List<DropDownItemResponse>> GetNexusLookUpCodeValues(NexusLookUpCodeTypes type)
    {
        return await _nexusLookUpService.GetNexusLookUpValuesByCodeForDropDownAsync(type);
    }


    [HttpGet("system-users/{ignoreLoggedInUser}")]
    [OpenApiOperation("Retrieve system users", "")]
    public async Task<List<UserDropDownItemResponse>> GetSystemUsers(bool ignoreLoggedInUser)
    {
        return await _userService.GetUsersForDropDownAsync(ignoreLoggedInUser);
    }

    [HttpGet("system-users-direct-reports")]
    [OpenApiOperation("Retrieve system users who report directly to the current user", "")]
    public async Task<List<UserDropDownItemResponse>> GetDirectReportSystemUsers(CancellationToken cancellationToken)
    {
        return await _userService.GetDirectReportUsersForDropDownAsync(cancellationToken);
    }

    [HttpGet("get-localization-countries")]
    [OpenApiOperation("Retrieve localization countries", "")]
    public async Task<List<DropDownItemResponse>> GetLocalizationCountries()
    {
        return await _localizationService.GetLocalizationCountriesAsync();
    }

    [HttpPost("get-country-localization/{id}")]
    [OpenApiOperation("Get a localization for selected country ", "")]
    public async Task<List<ViewCountryLocalizationResponse>> GetCountryLocalization(DefaultIdType id)
    {
        return await _localizationService.GetCountryLocalizationAsync(id);
    }

    [HttpGet("active-offerings")]
    [OpenApiOperation("Get active offering dropdown", "")]
    public async Task<List<OfferingDropDownItemResponse>> GetActiveOfferings(CancellationToken cancellationToken)
    {
        return await _offeringService.GetActiveDropDownAsync(cancellationToken);
    }
}
