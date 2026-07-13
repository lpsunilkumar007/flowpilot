using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using FlowPilot.Infrastructure.Nexus.Identity.DbModels;
using FlowPilot.Infrastructure.Persistence.Context.Nexus;

namespace FlowPilot.Infrastructure.Nexus.Identity;

internal static class Startup
{
    internal static IServiceCollection AddIdentity(this IServiceCollection services)
    {
        services
           .AddIdentity<ApplicationUser, ApplicationRole>(options =>
           {
               options.Password.RequiredLength = 6;
               options.Password.RequireDigit = true;
               options.Password.RequireLowercase = true;
               options.Password.RequireNonAlphanumeric = true;
               options.Password.RequireUppercase = true;
               options.User.RequireUniqueEmail = true;

               options.SignIn.RequireConfirmedEmail = true;
               options.Tokens.AuthenticatorTokenProvider = TokenOptions.DefaultAuthenticatorProvider;
           })
           .AddEntityFrameworkStores<NexusDbContext>()
           .AddDefaultTokenProviders();

        services.Configure<DataProtectionTokenProviderOptions>(options =>
        {
             options.TokenLifespan = TimeSpan.FromMinutes(10);
        });

        return services;
    }

}
