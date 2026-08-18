using FlowPilot.Application.Common.Models;
using FlowPilot.Application.CRM;
using FlowPilot.Application.CRM.Model.Request.Campaign;
using FlowPilot.Application.CRM.Model.Response.Campaign;
using FlowPilot.Host.Controllers.BaseControllers;

namespace FlowPilot.Host.Controllers.CRM;

public class CampaignController : VersionedApiController
{
    private readonly ICampaignService _campaignService;

    public CampaignController(ICampaignService campaignService)
    {
        _campaignService = campaignService;
    }

    [HttpGet]
    [MustHavePermission(SystemAction.View, SystemResource.ManageCampaigns)]
    [OpenApiOperation("Search campaigns", "")]
    public async Task<PaginationResponse<ViewCampaignResponse>> Search([FromQuery] SearchCampaignRequest request, CancellationToken cancellationToken)
    {
        return await _campaignService.SearchAsync(request, cancellationToken);
    }

    [HttpGet("leads-by-offering/{offeringId}")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageCampaigns)]
    [OpenApiOperation("Get leads for campaign picker by offering", "")]
    public async Task<List<ViewCampaignLeadPickerResponse>> GetLeadsByOffering(DefaultIdType offeringId, CancellationToken cancellationToken)
    {
        return await _campaignService.GetLeadsByOfferingAsync(offeringId, cancellationToken);
    }

    [HttpGet("{id}")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageCampaigns)]
    [OpenApiOperation("Get campaign by id", "")]
    public async Task<ViewCampaignDetailResponse> GetById(DefaultIdType id, CancellationToken cancellationToken)
    {
        return await _campaignService.GetByIdAsync(id, cancellationToken);
    }

    [HttpPost]
    [MustHavePermission(SystemAction.Create, SystemResource.ManageCampaigns)]
    [OpenApiOperation("Create a new campaign", "")]
    public async Task<CreateCampaignResponse> Create(CreateCampaignRequest request, CancellationToken cancellationToken)
    {
        return await _campaignService.CreateAsync(request, cancellationToken);
    }

    [HttpPut("{id}")]
    [MustHavePermission(SystemAction.Update, SystemResource.ManageCampaigns)]
    [OpenApiOperation("Update campaign details", "")]
    public async Task<string> Update(DefaultIdType id, UpdateCampaignRequest request, CancellationToken cancellationToken)
    {
        request.Id = id;
        return await _campaignService.UpdateAsync(id, request, cancellationToken);
    }
}
