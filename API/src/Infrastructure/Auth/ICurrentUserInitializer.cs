using System.Security.Claims;

namespace FlowPilot.Infrastructure.Auth;

public interface ICurrentUserInitializer
{
    void SetCurrentUser(ClaimsPrincipal user);

    void SetCurrentUserId(string userId);

    void SetCurrentTenant(int tenantId, Guid tenantUniqueId);
}
