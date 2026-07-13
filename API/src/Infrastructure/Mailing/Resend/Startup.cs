using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Resend;

namespace FlowPilot.Infrastructure.Mailing.Resend;
internal static class Startup
{
    internal static IServiceCollection AddResendMailing(this IServiceCollection services, IConfiguration config)
    {
        services.Configure<ResendMailSettings>(config.GetSection($"MailSettings:{nameof(ResendMailSettings)}"));

        services.AddOptions();
        services.AddHttpClient<ResendClient>();
        services.Configure<ResendClientOptions>(o =>
        {
            string? settings = config[$"MailSettings:{nameof(ResendMailSettings)}:APIKey"];
            o.ApiToken = !string.IsNullOrEmpty(settings) ? settings : "-- test --";
        });
        services.AddTransient<IResend, ResendClient>();

        return services;
    }
}
