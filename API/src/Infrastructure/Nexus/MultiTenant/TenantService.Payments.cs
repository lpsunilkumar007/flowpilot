using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Infrastructure.SystemConstants;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Nexus.MultiTenant;
public partial class TenantService
{
    public async Task<string?> GetTenantStripeCustomerIdAsync(Guid tenantUniqueId)
    {
        var tenant = await _nexusDbContext.Tenants.SingleAsync(x => x.UniqueId == tenantUniqueId);
        _ = tenant ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Tenant"));

        return tenant.StripeCustomerId;
    }

    public async Task SaveTenantStripeCustomerIdAsync(Guid tenantUniqueId, string stripeCustomerId)
    {
        var tenant = await _nexusDbContext.Tenants.SingleAsync(x => x.UniqueId == tenantUniqueId);
        _ = tenant ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Tenant"));

        tenant.StripeCustomerId = stripeCustomerId;
        _nexusDbContext.Tenants.Update(tenant);
        await _nexusDbContext.SaveChangesAsync();
    }
}
