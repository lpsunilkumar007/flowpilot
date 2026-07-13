using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FlowPilot.Infrastructure.Mailing.Aws;
internal static class Startup
{
    internal static IServiceCollection AddAwsMailing(this IServiceCollection services, IConfiguration config)
    {
        services.Configure<AwsMailSettings>(config.GetSection($"MailSettings:{nameof(AwsMailSettings)}"));
        return services;
    }
}
