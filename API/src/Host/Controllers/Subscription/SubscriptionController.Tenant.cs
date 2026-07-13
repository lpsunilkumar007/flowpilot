using FlowPilot.Application.Nexus.Subscription.Models.Response;

namespace FlowPilot.Host.Controllers.Subscription;

public partial class SubscriptionController
{
    [HttpGet("current-subscription-detail")]
    public async Task<TenantCurrentSubscriptionDetailResponse> GetCurrentSubscriptionDetail()
    {
        return await _subscriptionService.GetTenantCurrentSubscriptionDetail();
    }
}
