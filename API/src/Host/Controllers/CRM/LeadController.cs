using FlowPilot.Application.Common.Models;
using FlowPilot.Application.Common.Notes.Model.Request;
using FlowPilot.Application.Common.Notes.Model.Response;
using FlowPilot.Application.CRM;
using FlowPilot.Application.CRM.Model.Request.Lead;
using FlowPilot.Application.CRM.Model.Request.LeadActivity;
using FlowPilot.Application.CRM.Model.Response.Lead;
using FlowPilot.Application.CRM.Model.Response.LeadActivity;
using FlowPilot.Host.Controllers.BaseControllers;
using FlowPilot.Shared.Authorization;

namespace FlowPilot.Host.Controllers.CRM;

public class LeadController : VersionedApiController
{
    private readonly ILeadService _leadService;

    public LeadController(ILeadService leadService)
    {
        _leadService = leadService;
    }

    [HttpGet]
    [MustHavePermission(SystemAction.View, SystemResource.ManageLeads)]
    [OpenApiOperation("Search leads", "")]
    public async Task<PaginationResponse<ViewLeadListResponse>> Search([FromQuery] SearchLeadRequest request, CancellationToken cancellationToken)
    {
        return await _leadService.SearchAsync(request, cancellationToken);
    }

    [HttpGet("followups/today")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageLeads)]
    [OpenApiOperation("Get today's follow-ups", "")]
    public async Task<List<ViewLeadListResponse>> GetTodayFollowUps(CancellationToken cancellationToken)
    {
        return await _leadService.GetTodayFollowUpsAsync(cancellationToken);
    }

    [HttpGet("followups/overdue")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageLeads)]
    [OpenApiOperation("Get overdue follow-ups", "")]
    public async Task<List<ViewLeadListResponse>> GetOverdueFollowUps(CancellationToken cancellationToken)
    {
        return await _leadService.GetOverdueFollowUpsAsync(cancellationToken);
    }

    [HttpGet("{id}")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageLeads)]
    [OpenApiOperation("Get lead detail by id", "")]
    public async Task<ViewLeadDetailResponse> GetById(DefaultIdType id, CancellationToken cancellationToken)
    {
        return await _leadService.GetByIdAsync(id, cancellationToken);
    }

    [HttpPost]
    [MustHavePermission(SystemAction.Create, SystemResource.ManageLeads)]
    [OpenApiOperation("Create a new lead", "")]
    public async Task<CreateLeadResponse> Create(CreateLeadRequest request, CancellationToken cancellationToken)
    {
        return await _leadService.CreateAsync(request, cancellationToken);
    }

    [HttpPut("{id}")]
    [MustHavePermission(SystemAction.Update, SystemResource.ManageLeads)]
    [OpenApiOperation("Update lead", "")]
    public async Task<string> Update(DefaultIdType id, UpdateLeadRequest request, CancellationToken cancellationToken)
    {
        return await _leadService.UpdateAsync(id, request, cancellationToken);
    }

    [HttpPost("{id}/status")]
    [MustHavePermission(SystemAction.Update, SystemResource.ManageLeads)]
    [OpenApiOperation("Update lead status", "")]
    public async Task<string> UpdateStatus(DefaultIdType id, UpdateLeadStatusRequest request, CancellationToken cancellationToken)
    {
        return await _leadService.UpdateStatusAsync(id, request, cancellationToken);
    }

    [HttpPost("{id}/assign")]
    [MustHavePermission(SystemAction.Update, SystemResource.ManageLeads)]
    [OpenApiOperation("Assign or reassign lead", "")]
    public async Task<string> Assign(DefaultIdType id, AssignLeadRequest request, CancellationToken cancellationToken)
    {
        return await _leadService.AssignAsync(id, request, cancellationToken);
    }

    [HttpGet("{id}/activities")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageLeads)]
    [OpenApiOperation("Get lead activity timeline", "")]
    public async Task<List<ViewLeadActivityResponse>> GetActivities(DefaultIdType id, CancellationToken cancellationToken)
    {
        return await _leadService.GetActivitiesAsync(id, cancellationToken);
    }

    [HttpPost("{id}/activities")]
    [MustHavePermission(SystemAction.Create, SystemResource.ManageLeads)]
    [OpenApiOperation("Add lead activity", "")]
    public async Task<ViewLeadActivityResponse> CreateActivity(DefaultIdType id, CreateLeadActivityRequest request, CancellationToken cancellationToken)
    {
        return await _leadService.CreateActivityAsync(id, request, cancellationToken);
    }

    [HttpGet("{id}/notes")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageLeads)]
    [OpenApiOperation("Get lead notes", "")]
    public async Task<List<ViewEntityNoteResponse>> GetNotes(DefaultIdType id, CancellationToken cancellationToken)
    {
        return await _leadService.GetNotesAsync(id, cancellationToken);
    }

    [HttpPost("{id}/notes")]
    [MustHavePermission(SystemAction.Create, SystemResource.ManageLeads)]
    [OpenApiOperation("Add lead note", "")]
    public async Task<ViewEntityNoteResponse> CreateNote(DefaultIdType id, CreateEntityNoteRequest request, CancellationToken cancellationToken)
    {
        return await _leadService.CreateNoteAsync(id, request, cancellationToken);
    }
}
