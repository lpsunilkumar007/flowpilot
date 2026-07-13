using FlowPilot.Application.Nexus.MultiTenant;
using FlowPilot.Application.Nexus.Subscription;
using FlowPilot.Infrastructure.Persistence.Context.Nexus;

namespace FlowPilot.Infrastructure.Nexus.MultiTenant;
public partial class TenantService : ITenantService
{
    public readonly NexusDbContext _nexusDbContext;
    public readonly ISubscriptionService _subscriptionService;

    public TenantService(NexusDbContext nexusDbContext, ISubscriptionService subscriptionService)
    {
        _nexusDbContext = nexusDbContext;
        _subscriptionService = subscriptionService;
    }

}
