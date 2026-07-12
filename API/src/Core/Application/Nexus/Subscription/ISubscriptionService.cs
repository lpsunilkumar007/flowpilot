using FlowPilot.Application.Nexus.MultiTenant.Models.Response;
using FlowPilot.Application.Nexus.Subscription.Models;
using FlowPilot.Application.Nexus.Subscription.Models.Response;

namespace FlowPilot.Application.Nexus.Subscription;
public interface ISubscriptionService : ITransientService
{
    Task SeedSubscriptions();

    Task<int> GetRootAdminSubscriptionIdAsync();

    Task<int> GetRegisteredUserDefaultSubscriptionAsync();

    Task<AssignSubscriptionPlanResponse> AssignSubscriptionPlan(AssignSubscriptionPlanDto request);

    Task UpdateTenantSubscriptionPlanInvoice(string stripeJsonPayload,string stripePaymentStatus);

    Task<TenantCurrentSubscriptionDetailResponse> GetTenantCurrentSubscriptionDetail();

    Task<List<GetSubscriptionPlanDetailsResponse>> GetAllSubscriptionDetailsForAnonymousUsers();

    Task<bool> IsInitialPayment(string stripeSubscriptionId);

    Task<List<GetTenantSubscriptionResponse>> GetTenantSubscriptionsAsync(DefaultIdType? Id);

}
