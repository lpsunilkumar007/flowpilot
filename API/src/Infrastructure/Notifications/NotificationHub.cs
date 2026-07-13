using System.Security.Claims;
using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Shared.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace FlowPilot.Infrastructure.Notifications;
[Authorize]
public class NotificationHub : Hub, ITransientService
{
    

    public override async Task OnConnectedAsync()
    {
        var user = Context.User;

        if (user is null)
            throw new UnauthorizedException("Authentication Failed.");

        string? tenantId = user.FindFirstValue(SystemClaims.TenantUniqueId);
        string? userId = user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(tenantId) || string.IsNullOrEmpty(userId))
            throw new UnauthorizedException("Authentication Failed. Required claims missing.");

        await Groups.AddToGroupAsync(Context.ConnectionId, $"GroupTenant-{tenantId}");

        await base.OnConnectedAsync();

       
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var user = Context.User;

        if (user is null)
            throw new UnauthorizedException("Authentication Failed.");

        string? tenantId = user.FindFirstValue(SystemClaims.TenantUniqueId);
        string? userId = user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(tenantId) || string.IsNullOrEmpty(userId))
            throw new UnauthorizedException("Authentication Failed. Required claims missing.");

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"GroupTenant-{tenantId}");

        await base.OnDisconnectedAsync(exception);

         
    }
}
