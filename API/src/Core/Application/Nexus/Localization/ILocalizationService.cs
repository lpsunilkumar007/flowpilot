using FlowPilot.Application.Common.Models;
using FlowPilot.Application.Common.Models.Response;
using FlowPilot.Application.Nexus.Localization.Models.Request;
using FlowPilot.Application.Nexus.Localization.Models.Response;

namespace FlowPilot.Application.Nexus.Localization;
public interface ILocalizationService : ITransientService
{
    Task<CreateCountryResponse> CreateCountryAsync(CreateCountryRequest request);

    Task<List<ViewCountryResponse>> GetCountryAsync();

    Task<ViewCountryResponse> GetCountryByIdAsync(DefaultIdType id);

    Task<string> UpdateCountryAsync(UpdateCountryRequest request);

    Task<string> DeleteCountryAsync(DefaultIdType countryId);

    Task<CreateCountryLocalizationResponse> CreateCountryLocalizationAsync(CreateCountryLocalizationRequest request);

    Task<PaginationResponse<ViewCountryLocalizationResponse>> GetCountryLocalizationAsync(SearchCountryLocalizationRequest request);

    Task<List<ViewCountryLocalizationResponse>> GetCountryLocalizationAsync(DefaultIdType id);

    Task<List<DropDownItemResponse>> GetLocalizationCountriesAsync();

    Task<ViewCountryLocalizationResponse> GetCountryLocalizationByIdAsync(DefaultIdType id);

    Task<string> UpdateCountryLocalizationAsync(UpdateCountryLocalizationRequest request);

    Task RefreshCountryLocalizations();

}
