using FlowPilot.Application.Common.Models;
using FlowPilot.Application.CRM.Model.Request.Offering;
using FlowPilot.Application.CRM.Model.Response.Offering;

namespace FlowPilot.Application.CRM;

public interface IOfferingService : ITransientService
{
    Task<PaginationResponse<ViewOfferingResponse>> SearchAsync(SearchOfferingRequest request, CancellationToken cancellationToken = default);

    Task<List<OfferingDropDownItemResponse>> GetActiveDropDownAsync(CancellationToken cancellationToken = default);

    Task<ViewOfferingResponse> GetByIdAsync(DefaultIdType id, CancellationToken cancellationToken = default);

    Task<CreateOfferingResponse> CreateAsync(CreateOfferingRequest request, CancellationToken cancellationToken = default);

    Task<string> UpdateAsync(DefaultIdType id, UpdateOfferingRequest request, CancellationToken cancellationToken = default);

    Task<string> UpdateStatusAsync(DefaultIdType id, UpdateOfferingStatusRequest request, CancellationToken cancellationToken = default);

    Task<string> DeleteAsync(DefaultIdType id, CancellationToken cancellationToken = default);
}
