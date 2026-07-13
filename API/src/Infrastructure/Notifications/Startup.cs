using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FlowPilot.Infrastructure.Notifications;
internal static class Startup
{
    internal static IServiceCollection AddNotifications(this IServiceCollection services, IConfiguration config)
    {
        services.AddSignalR();

        return services;
    }

    internal static IEndpointRouteBuilder MapNotifications(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapHub<NotificationHub>("/notifications", options =>
        {
            options.CloseOnAuthenticationExpiration = true;
        });
        return endpoints;
    }
}
