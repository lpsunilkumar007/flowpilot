using FlowPilot.Application.Common.Models;
using FlowPilot.Application.CRM.Model.Request.LeadVisit;
using FlowPilot.Application.CRM.Model.Response.LeadVisit;

namespace FlowPilot.Application.CRM;

public interface ILeadVisitService : ITransientService
{
    Task<PaginationResponse<ViewLeadVisitResponse>> SearchAsync(SearchLeadVisitRequest request, CancellationToken cancellationToken = default);

    Task<ViewLeadVisitResponse> GetByIdAsync(DefaultIdType id, CancellationToken cancellationToken = default);

    Task<CreateLeadVisitResponse> CreateAsync(
        CreateLeadVisitRequest request,
        CancellationToken cancellationToken = default,
        decimal? referenceLatitude = null,
        decimal? referenceLongitude = null);

    Task<CreateLeadWithVisitResponse> CreateWithLeadAsync(CreateLeadWithVisitRequest request, CancellationToken cancellationToken = default);

    Task<UpdateLeadWithVisitResponse> UpdateWithLeadAsync(DefaultIdType id, UpdateLeadWithVisitRequest request, CancellationToken cancellationToken = default);

    Task<ViewGpsLogResponse> LogGpsAsync(DefaultIdType id, LogGpsRequest request, CancellationToken cancellationToken = default);

    Task<ViewLeadImageResponse> AddImageAsync(DefaultIdType id, AddLeadVisitImageRequest request, CancellationToken cancellationToken = default);

    Task<string> DeleteAsync(DefaultIdType id, CancellationToken cancellationToken = default);
}
