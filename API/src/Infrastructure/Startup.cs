using Asp.Versioning;
using FlowPilot.Infrastructure.Auth;
using FlowPilot.Infrastructure.BackgroundJobs;
using FlowPilot.Infrastructure.Caching;
using FlowPilot.Infrastructure.Common;
using FlowPilot.Infrastructure.Cors;
using FlowPilot.Infrastructure.ExternalIntegrations.Jitsi;
using FlowPilot.Infrastructure.ExternalIntegrations.Stripe;
using FlowPilot.Infrastructure.FileStorage;
using FlowPilot.Infrastructure.FrontUserPortal;
using FlowPilot.Infrastructure.Mailing;
using FlowPilot.Infrastructure.Middleware;
using FlowPilot.Infrastructure.Nexus;
using FlowPilot.Infrastructure.Notifications;
using FlowPilot.Infrastructure.OpenApi;
using FlowPilot.Infrastructure.Persistence;
using FlowPilot.Infrastructure.Persistence.Initialization;
using FlowPilot.Infrastructure.SecurityHeaders;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FlowPilot.Infrastructure;

public static class Startup
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        //var applicationAssembly = typeof(WorkPower.WebApi.Application.Startup).GetTypeInfo().Assembly;
        //MapsterSettings.Configure();
        return services
            .AddApiVersioning()
            .AddAuth(config)
            .AddBackgroundJobs(config)
            .AddCaching(config)
            .AddCorsPolicy(config)
            .AddExceptionMiddleware()
            //.AddBehaviours(applicationAssembly)
            //.AddHealthCheck()
            //.AddPOLocalization(config)
            .AddMailing(config)
            //.AddMediatR(Assembly.GetExecutingAssembly())
            /////////.AddMultitenancy() -- not required
            .AddNexus()
            .AddNotifications(config)
            .AddOpenApiDocumentation(config)
            .AddPersistence()
            .AddRequestLogging(config)
            .AddRouting(options => options.LowercaseUrls = true)
            .AddServices()
            .AddFrontUserPortal(config)
            .AddJitsi(config)
            .AddStripePayment(config)
            .AddFileStorage(config)
            //.AddScoped(typeof(IRepository<>), typeof(ApplicationDbRepository<>))
            ; 
        ;
    }

    private static IServiceCollection AddApiVersioning(this IServiceCollection services) =>
        services.AddApiVersioning(config =>
        {
            config.DefaultApiVersion = new ApiVersion(1, 0);
            config.AssumeDefaultVersionWhenUnspecified = true;
            config.ReportApiVersions = true;
        })
        .AddMvc()
        .AddApiExplorer(options =>
        {
            options.GroupNameFormat = "'v'VVV";
            options.SubstituteApiVersionInUrl = true;
        })
        .Services;

    //private static IServiceCollection AddHealthCheck(this IServiceCollection services) =>
    //    services.AddHealthChecks().AddCheck<TenantHealthCheck>("Tenant").Services;

    public static async Task InitializeDatabasesAsync(this IServiceProvider services, CancellationToken cancellationToken = default)
    {
        // Create a new scope to retrieve scoped services
        using var scope = services.CreateScope();

        await scope.ServiceProvider.GetRequiredService<IDatabaseInitializer>()
            .InitializeDatabasesAsync(cancellationToken);
    }

    public static IApplicationBuilder UseInfrastructure(this IApplicationBuilder builder, IConfiguration config) =>
        builder
            //.UseRequestLocalization()
            .UseStaticFiles()
            .UseSecurityHeaders(config)
            .UseFileStorage(config)
            .UseExceptionMiddleware()
            .UseRouting()
            .UseCorsPolicy()
            .UseAuthentication()
            .UseCurrentUser()
            /////////.UseMultiTenancy()-- not required
            .UseAuthorization()
            .UseRequestLogging(config)
            .UseHangfireDashboard(config)
            .UseOpenApiDocumentation(config)
        ;

    public static IEndpointRouteBuilder MapEndpoints(this IEndpointRouteBuilder builder)
    {
        builder.MapControllers().RequireAuthorization();
        //builder.MapHealthCheck();
        builder.MapNotifications();
        return builder;
    }

    //private static IEndpointConventionBuilder MapHealthCheck(this IEndpointRouteBuilder endpoints) =>
    //    endpoints.MapHealthChecks("/api/health");
}
