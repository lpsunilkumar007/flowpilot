using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FlowPilot.Infrastructure.ExternalIntegrations.Jitsi;
internal static class Startup
{
    internal static IServiceCollection AddJitsi(this IServiceCollection services, IConfiguration config)
    {
        services.Configure<JitsiSettings>(config.GetSection($"ExternalIntegrations:{nameof(JitsiSettings)}"));

        return services;
    }
}
