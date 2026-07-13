using Amazon.Runtime;
using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Models;
using FlowPilot.Application.Nexus.Localization.Models.Response;
using FlowPilot.Application.Nexus.MultiTenant.Models;
using FlowPilot.Application.Nexus.MultiTenant.Models.Request;
using FlowPilot.Application.Nexus.MultiTenant.Models.Response;
using FlowPilot.Application.Nexus.Subscription.Models;
using FlowPilot.Infrastructure.Nexus.Localization.DbModels;
using FlowPilot.Infrastructure.Nexus.MultiTenant.DbModels;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Infrastructure.SystemConstants;
using FlowPilot.Shared.Nexus;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Nexus.MultiTenant;
public partial class TenantService
{
    public async Task<CreateTenantResponse> CreateAsync(CreateTenantRequest request, CancellationToken cancellationToken)
    {
        var tenant = new Tenants
        {
            UniqueId = request.UniqueId,
            Name = request.Name,
            AdminEmail = request.AdminEmail,
            ConnectionString = request.ConnectionString,
            IsActive = request.IsActive,

        };
        await _nexusDbContext.Tenants.AddAsync(tenant, cancellationToken);
        await _nexusDbContext.SaveChangesAsync(cancellationToken);

        int subscriptionPlanPKId = 0;

        if (request.UniqueId == NexusConstants.Root.TenantUniqueId)
        {
            subscriptionPlanPKId = await _subscriptionService.GetRootAdminSubscriptionIdAsync();
        }
        else
        {
            subscriptionPlanPKId = await _subscriptionService.GetRegisteredUserDefaultSubscriptionAsync();
        }

        await _subscriptionService.AssignSubscriptionPlan(new AssignSubscriptionPlanDto
        {
            IsDefaultViaRegistration = true,
            TenantUniqueId = tenant.UniqueId,
            SubscriptionPlanId = subscriptionPlanPKId,
        });

        return new CreateTenantResponse { TenantId = tenant.Id, UniqueId = tenant.UniqueId };
    }

    public async Task<TenantsDto> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var item = await _nexusDbContext.Tenants.SingleAsync(x => x.Id == id, cancellationToken);

        _ = item ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Tenant"));

        return new TenantsDto
        {
            Id = item.Id,
            UniqueId = item.UniqueId,
            Name = item.Name,
            AdminEmail = item.AdminEmail,
            ConnectionString = item.ConnectionString,
            IsActive = item.IsActive,

        };
    }

    public async Task<TenantsDto> GetByUserIdAsync(string userId, CancellationToken cancellationToken)
    {
        var user = await _nexusDbContext.Users.Include(x => x.Tenant).SingleAsync(x => x.Id == userId, cancellationToken);
        return new TenantsDto
        {
            Id = user.Tenant.Id,
            UniqueId = user.Tenant.UniqueId,
            Name = user.Tenant.Name,
            AdminEmail = user.Tenant.AdminEmail,
            ConnectionString = user.Tenant.ConnectionString,
            IsActive = user.Tenant.IsActive,

        };
    }

    public async Task<PaginationResponse<ViewTenantResponse>> GetTenantsAsync(SearchTenantRequest request)
    {
        var query = _nexusDbContext.Tenants.AsQueryable();

        if (!string.IsNullOrEmpty(request.FreeText))
        {
            string searchText = request.FreeText.ToLower();
            query = query.Where(x => x.Name.ToLower().Contains(searchText) || x.AdminEmail.ToLower().Contains(searchText));
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(x => x.IsActive == request.IsActive.Value);
        }

        var result = query.Select(x => new ViewTenantResponse
        {
            Name = x.Name,
            AdminEmail = x.AdminEmail,
            IsActive = x.IsActive,
            StripeCustomerId = x.StripeCustomerId,
            CreatedOn = x.CreatedOn,
            Id = x.Id
        });

        return await result.PaginatedListAsync<ViewTenantResponse, ViewTenantResponse>(request.PageNumber, request.PageSize);
    }

    public async Task<ViewTenantResponse> GetTenantByIdAsync(DefaultIdType id)
    {
        var entity = await _nexusDbContext.Tenants.SingleOrDefaultAsync(x => x.Id == id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Tenant"));

        return new ViewTenantResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            AdminEmail = entity.AdminEmail,
            IsActive = entity.IsActive,
            CreatedOn = entity.CreatedOn,
            StripeCustomerId = entity.StripeCustomerId
        };
    }

    public async Task<string> UpdateTenantDetails(UpdateTenantRequest request)
    {
        var entity = await _nexusDbContext.Tenants.SingleOrDefaultAsync(x => x.Id == request.Id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Tenant"));

        entity.Name = request.Name;
        entity.AdminEmail = request.AdminEmail;
        entity.IsActive = request.IsActive;

        _nexusDbContext.Tenants.Update(entity);
        await _nexusDbContext.SaveChangesAsync();

        return SuccessMessages.RecordUpdatedSuccessfully;

    }
}
