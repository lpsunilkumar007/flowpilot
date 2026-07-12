using FlowPilot.Application.Common.Models;
using FlowPilot.Application.Nexus.MultiTenant.Models;
using FlowPilot.Application.Nexus.MultiTenant.Models.Request;
using FlowPilot.Application.Nexus.MultiTenant.Models.Response;

namespace FlowPilot.Application.Nexus.MultiTenant;
public interface ITenantService : ITransientService
{
    Task<CreateTenantResponse> CreateAsync(CreateTenantRequest request, CancellationToken cancellationToken);

    Task<TenantsDto> GetByIdAsync(int id, CancellationToken cancellationToken);

    Task<TenantsDto> GetByUserIdAsync(string userId, CancellationToken cancellationToken);

    Task<string?> GetTenantStripeCustomerIdAsync(Guid tenantUniqueId);

    Task SaveTenantStripeCustomerIdAsync(Guid tenantUniqueId, string stripeCustomerId);

    Task<PaginationResponse<ViewTenantResponse>> GetTenantsAsync(SearchTenantRequest request);

    Task<ViewTenantResponse> GetTenantByIdAsync(DefaultIdType id);

    Task<string> UpdateTenantDetails(UpdateTenantRequest request);

}
