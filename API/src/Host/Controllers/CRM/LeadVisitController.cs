using FlowPilot.Application.Common.Models;
using FlowPilot.Application.CRM;
using FlowPilot.Application.CRM.Model.Request.LeadVisit;
using FlowPilot.Application.CRM.Model.Response.LeadVisit;
using FlowPilot.Host.Controllers.BaseControllers;

namespace FlowPilot.Host.Controllers.CRM;

public class LeadVisitController : VersionedApiController
{
    private readonly ILeadVisitService _leadVisitService;

    public LeadVisitController(ILeadVisitService leadVisitService)
    {
        _leadVisitService = leadVisitService;
    }

    [HttpPost("search")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageLeadVisits)]
    [OpenApiOperation("Search lead visits", "")]
    public async Task<PaginationResponse<ViewLeadVisitResponse>> Search(SearchLeadVisitRequest request, CancellationToken cancellationToken)
    {
        return await _leadVisitService.SearchAsync(request, cancellationToken);
    }

    [HttpGet("{id}")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageLeadVisits)]
    [OpenApiOperation("Get lead visit by id", "")]
    public async Task<ViewLeadVisitResponse> GetById(DefaultIdType id, CancellationToken cancellationToken)
    {
        return await _leadVisitService.GetByIdAsync(id, cancellationToken);
    }

    [HttpPost("create")]
    [MustHavePermission(SystemAction.Create, SystemResource.ManageLeadVisits)]
    [OpenApiOperation("Create a new lead visit", "")]
    public async Task<CreateLeadVisitResponse> Create(CreateLeadVisitRequest request, CancellationToken cancellationToken)
    {
        return await _leadVisitService.CreateAsync(request, cancellationToken);
    }

    [HttpPost("create-with-lead")]
    [MustHavePermission(SystemAction.Create, SystemResource.ManageLeadVisits)]
    [OpenApiOperation("Create a new lead with visit", "")]
    public async Task<CreateLeadWithVisitResponse> CreateWithLead(CreateLeadWithVisitRequest request, CancellationToken cancellationToken)
    {
        return await _leadVisitService.CreateWithLeadAsync(request, cancellationToken);
    }

    [HttpPost("{id}/gps")]
    [MustHavePermission(SystemAction.Update, SystemResource.ManageLeadVisits)]
    [OpenApiOperation("Log a GPS point for a lead visit", "")]
    public async Task<ViewGpsLogResponse> LogGps(DefaultIdType id, LogGpsRequest request, CancellationToken cancellationToken)
    {
        return await _leadVisitService.LogGpsAsync(id, request, cancellationToken);
    }

    [HttpPost("{id}/images")]
    [MustHavePermission(SystemAction.Update, SystemResource.ManageLeadVisits)]
    [OpenApiOperation("Add an image to a lead visit", "")]
    public async Task<ViewLeadImageResponse> AddImage(DefaultIdType id, AddLeadVisitImageRequest request, CancellationToken cancellationToken)
    {
        return await _leadVisitService.AddImageAsync(id, request, cancellationToken);
    }

    [HttpDelete("delete/{id}")]
    [MustHavePermission(SystemAction.Delete, SystemResource.ManageLeadVisits)]
    [OpenApiOperation("Delete lead visit", "")]
    public async Task<string> Delete(DefaultIdType id, CancellationToken cancellationToken)
    {
        return await _leadVisitService.DeleteAsync(id, cancellationToken);
    }
}
