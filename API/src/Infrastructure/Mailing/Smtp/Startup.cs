using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FlowPilot.Infrastructure.Mailing.Smtp;
internal static class Startup
{
    internal static IServiceCollection AddSmtpMailing(this IServiceCollection services, IConfiguration config)
    {
        services.Configure<SmtpMailSetting>(config.GetSection($"MailSettings:{nameof(SmtpMailSetting)}"));
        return services;
    }
}
