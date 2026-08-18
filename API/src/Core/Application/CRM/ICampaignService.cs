using FlowPilot.Application.Common.Models;
using FlowPilot.Application.CRM.Model.Request.Campaign;
using FlowPilot.Application.CRM.Model.Response.Campaign;

namespace FlowPilot.Application.CRM;

public interface ICampaignService : ITransientService
{
    Task<PaginationResponse<ViewCampaignResponse>> SearchAsync(SearchCampaignRequest request, CancellationToken cancellationToken = default);

    Task<ViewCampaignDetailResponse> GetByIdAsync(DefaultIdType id, CancellationToken cancellationToken = default);

    Task<List<ViewCampaignLeadPickerResponse>> GetLeadsByOfferingAsync(DefaultIdType offeringId, CancellationToken cancellationToken = default);

    Task<CreateCampaignResponse> CreateAsync(CreateCampaignRequest request, CancellationToken cancellationToken = default);

    Task<string> UpdateAsync(DefaultIdType id, UpdateCampaignRequest request, CancellationToken cancellationToken = default);
}
