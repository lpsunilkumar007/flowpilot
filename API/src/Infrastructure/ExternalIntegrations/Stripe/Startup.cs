using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stripe;

namespace FlowPilot.Infrastructure.ExternalIntegrations.Stripe;
internal static class StripeStartup
{
    internal static IServiceCollection AddStripePayment(
        this IServiceCollection services,
        IConfiguration config)
    {
        services.Configure<StripeSettings>(config.GetSection(nameof(StripeSettings)));
        var settings = config.GetSection(nameof(StripeSettings)).Get<StripeSettings>();
        // services.Configure<StripeSettings>(config.GetSection(nameof(StripeSettings)));

        //services.AddSingleton<IStripeClient>(sp =>
        //{
        //var stripeSettings = sp
        //     .GetRequiredService<IOptions<StripeSettings>>()
        //     .Value;

        //    return new StripeClient(stripeSettings.SecretKey);
        //});

        StripeConfiguration.ApiKey = settings.SecretKey;

        //services.AddTransient<ISubscriptionService, Nexus.Subscription.SubscriptionService>();

        return services;
    }
}

