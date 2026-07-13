using FlowPilot.Infrastructure.Mailing.Aws;
using FlowPilot.Infrastructure.Mailing.Resend;
using FlowPilot.Infrastructure.Mailing.SendGrid;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FlowPilot.Infrastructure.Mailing;

internal static class Startup
{
    internal static IServiceCollection AddMailing(this IServiceCollection services, IConfiguration config)
    {
        services.Configure<MailSettings>(config.GetSection(nameof(MailSettings)));
        return services
            .AddAwsMailing(config)
            .AddSendGridMailing(config)
            .AddResendMailing(config);
    }
}
