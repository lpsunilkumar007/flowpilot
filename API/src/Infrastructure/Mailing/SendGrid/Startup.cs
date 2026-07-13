using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using SendGrid;

namespace FlowPilot.Infrastructure.Mailing.SendGrid;
internal static class Startup
{
    internal static IServiceCollection AddSendGridMailing(this IServiceCollection services, IConfiguration config)
    {
        services.Configure<SendGridMailSettings>(config.GetSection($"MailSettings:{nameof(SendGridMailSettings)}"));

        services.AddSingleton<ISendGridClient>(sp =>
        {
            var config = sp.GetRequiredService<IOptions<SendGridMailSettings>>().Value;
            if (!string.IsNullOrEmpty(config.APIKey))
            {
                return new SendGridClient(config.APIKey);
            }
            return new SendGridClient("-- test --");
        });
        return services;
    }
}
