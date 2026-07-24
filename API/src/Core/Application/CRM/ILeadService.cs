using FlowPilot.Application.Common.Models;
using FlowPilot.Application.Common.Notes.Model.Request;
using FlowPilot.Application.Common.Notes.Model.Response;
using FlowPilot.Application.CRM.Model.Request.Lead;
using FlowPilot.Application.CRM.Model.Request.LeadActivity;
using FlowPilot.Application.CRM.Model.Response.Lead;
using FlowPilot.Application.CRM.Model.Response.LeadActivity;

namespace FlowPilot.Application.CRM;

public interface ILeadService : ITransientService
{
    Task<PaginationResponse<ViewLeadListResponse>> SearchAsync(SearchLeadRequest request, CancellationToken cancellationToken = default);

    Task<ViewLeadDetailResponse> GetByIdAsync(DefaultIdType id, CancellationToken cancellationToken = default);

    Task<CreateLeadResponse> CreateAsync(CreateLeadRequest request, CancellationToken cancellationToken = default);

    Task<string> UpdateAsync(DefaultIdType id, UpdateLeadRequest request, CancellationToken cancellationToken = default);

    Task<string> UpdateStatusAsync(DefaultIdType id, UpdateLeadStatusRequest request, CancellationToken cancellationToken = default);

    Task<string> AssignAsync(DefaultIdType id, AssignLeadRequest request, CancellationToken cancellationToken = default);

    Task<string> UpdateFollowUpDateAsync(DefaultIdType id, UpdateLeadFollowUpDateRequest request, CancellationToken cancellationToken = default);

    Task<List<ViewLeadListResponse>> GetTodayFollowUpsAsync(CancellationToken cancellationToken = default);

    Task<List<ViewLeadListResponse>> GetOverdueFollowUpsAsync(CancellationToken cancellationToken = default);

    Task<List<ViewLeadActivityResponse>> GetActivitiesAsync(DefaultIdType leadId, CancellationToken cancellationToken = default);

    Task<ViewLeadActivityResponse> CreateActivityAsync(DefaultIdType leadId, CreateLeadActivityRequest request, CancellationToken cancellationToken = default);

    Task<List<ViewEntityNoteResponse>> GetNotesAsync(DefaultIdType leadId, CancellationToken cancellationToken = default);

    Task<ViewEntityNoteResponse> CreateNoteAsync(DefaultIdType leadId, CreateEntityNoteRequest request, CancellationToken cancellationToken = default);
}
