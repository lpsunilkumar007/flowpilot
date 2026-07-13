using FlowPilot.Application.ExternalIntegrations.Stripe;
using FlowPilot.Application.Nexus.Subscription;
using FlowPilot.Host.Controllers.BaseControllers;
using FlowPilot.Infrastructure.ExternalIntegrations.Stripe;
using Microsoft.Extensions.Options;

namespace FlowPilot.Host.Controllers.Subscription;

public partial class SubscriptionController : VersionNeutralApiController
{
    private readonly ISubscriptionService _subscriptionService;
    private readonly IStripeService _stripeService;
    private readonly string _webhookSecret;
    public SubscriptionController(ISubscriptionService subscriptionService,IStripeService stripeService, IOptions<StripeSettings> stripeSettings)
    {
        _subscriptionService = subscriptionService;
        _stripeService = stripeService;
        _webhookSecret = stripeSettings.Value.WebhookSecret;
    }
}
