using FlowPilot.Application.Nexus.Subscription.Models.Response;

namespace FlowPilot.Host.Controllers.Subscription;

public partial class SubscriptionController
{

    /// <summary> 
    /// Get All Subscriptions Plan Details.
    /// </summary>
    /// <returns></returns>
    [HttpGet("get-all-subscriptions")]
    [AllowAnonymous]
    [OpenApiOperation("Retrieve all subscription details", "")]
    public async Task<List<GetSubscriptionPlanDetailsResponse>> GetAllSubscriptionDetails()
    {
        return await _subscriptionService.GetAllSubscriptionDetailsForAnonymousUsers();
    }
}
