using FlowPilot.Application.Common.Models;
using FlowPilot.Application.CRM;
using FlowPilot.Application.CRM.Model.Request.Offering;
using FlowPilot.Application.CRM.Model.Response.Offering;
using FlowPilot.Host.Controllers.BaseControllers;

namespace FlowPilot.Host.Controllers.CRM;

public class OfferingController : VersionedApiController
{
    private readonly IOfferingService _offeringService;

    public OfferingController(IOfferingService offeringService)
    {
        _offeringService = offeringService;
    }

    [HttpGet]
    [RequireAnyResource(SystemAction.View, [SystemResource.ManageOfferings, SystemResource.ManageLeads, SystemResource.ManageSalePipelines])]
    [OpenApiOperation("Search offerings", "")]
    public async Task<PaginationResponse<ViewOfferingResponse>> Search([FromQuery] SearchOfferingRequest request, CancellationToken cancellationToken)
    {
        return await _offeringService.SearchAsync(request, cancellationToken);
    }

    [HttpGet("{id}")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageOfferings)]
    [OpenApiOperation("Get offering by id", "")]
    public async Task<ViewOfferingResponse> GetById(DefaultIdType id, CancellationToken cancellationToken)
    {
        return await _offeringService.GetByIdAsync(id, cancellationToken);
    }

    [HttpPost]
    [MustHavePermission(SystemAction.Create, SystemResource.ManageOfferings)]
    [OpenApiOperation("Create a new offering", "")]
    public async Task<CreateOfferingResponse> Create(CreateOfferingRequest request, CancellationToken cancellationToken)
    {
        return await _offeringService.CreateAsync(request, cancellationToken);
    }

    [HttpPut("{id}")]
    [MustHavePermission(SystemAction.Update, SystemResource.ManageOfferings)]
    [OpenApiOperation("Update offering", "")]
    public async Task<string> Update(DefaultIdType id, UpdateOfferingRequest request, CancellationToken cancellationToken)
    {
        return await _offeringService.UpdateAsync(id, request, cancellationToken);
    }

    [HttpPost("{id}/status")]
    [MustHavePermission(SystemAction.Update, SystemResource.ManageOfferings)]
    [OpenApiOperation("Update offering status", "")]
    public async Task<string> UpdateStatus(DefaultIdType id, UpdateOfferingStatusRequest request, CancellationToken cancellationToken)
    {
        return await _offeringService.UpdateStatusAsync(id, request, cancellationToken);
    }

    [HttpDelete("{id}")]
    [MustHavePermission(SystemAction.Delete, SystemResource.ManageOfferings)]
    [OpenApiOperation("Delete offering", "")]
    public async Task<string> Delete(DefaultIdType id, CancellationToken cancellationToken)
    {
        return await _offeringService.DeleteAsync(id, cancellationToken);
    }
}
