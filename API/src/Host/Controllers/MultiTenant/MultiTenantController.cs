using FlowPilot.Application.Common.FileStorage;
using FlowPilot.Application.Common.Models;
using FlowPilot.Application.ExternalIntegrations.Stripe;
using FlowPilot.Application.Nexus.Identity.Users;
using FlowPilot.Application.Nexus.Identity.Users.Models.Response;
using FlowPilot.Application.Nexus.MultiTenant;
using FlowPilot.Application.Nexus.MultiTenant.Models.Request;
using FlowPilot.Application.Nexus.MultiTenant.Models.Response;
using FlowPilot.Application.Nexus.Subscription;
using FlowPilot.Host.Controllers.BaseControllers;

namespace FlowPilot.Host.Controllers.MultiTenant;

public class MultiTenantController : VersionNeutralApiController
{
    public readonly ITenantService _tenantService;
    public readonly ISubscriptionService _subscriptionService;
    private readonly IUserService _userService;
    private readonly IStripeService _stripeService;

    public MultiTenantController(ITenantService tenantService, ISubscriptionService subscriptionService,IUserService userService, IStripeService stripeService)
    {
        _tenantService = tenantService;
        _subscriptionService = subscriptionService;
        _userService = userService;
        _stripeService = stripeService;
    }

    [HttpPost("get-tenants")]
    [MustHavePermission(SystemAction.View, SystemResource.Tenants)]
    public async Task<PaginationResponse<ViewTenantResponse>> GetTenant(SearchTenantRequest request)
    {
        return await _tenantService.GetTenantsAsync(request);
    }

    [HttpGet("get-tenant-subscriptions/{id?}")]
    [RequireAnyResource(SystemAction.View, [SystemResource.Tenants, SystemResource.MySubscriptions])]
    public Task<List<GetTenantSubscriptionResponse>> GetTenantSubscription(DefaultIdType? id)
    {
      return _subscriptionService.GetTenantSubscriptionsAsync(id);
    }

    [HttpPost("download-invoice/{id}")]
    [RequireAnyResource(SystemAction.View, [SystemResource.Tenants, SystemResource.MySubscriptions])]
    public async Task<DownloadFileResponse> DownloadInvoice(DefaultIdType id)
    {
        return await _stripeService.DownloadInvoice(id);
    }

    [HttpGet("get-tenant-users/{id}")]
    [MustHavePermission(SystemAction.View, SystemResource.Tenants)]
    public async Task<List<ViewUserDetailsResponse>> GetTenantUsers(DefaultIdType id)
    {
        return await _userService.GetTenantUsersListAsync(id);
    }

    [HttpGet("get-tenant/{id}")]
    [MustHavePermission(SystemAction.View, SystemResource.Tenants)]
    public async Task<ViewTenantResponse> GetTenantById(DefaultIdType id)
    {
        return await _tenantService.GetTenantByIdAsync(id);
    }

    [HttpPut("update-tenant")]
    [MustHavePermission(SystemAction.Update, SystemResource.Tenants)]
    public async Task<string> UpdateTenantDetails(UpdateTenantRequest request)
    {
        return await _tenantService.UpdateTenantDetails(request);
    }
}
