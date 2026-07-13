using FlowPilot.Application.Common.Extensions;
using FlowPilot.Application.Common.FileStorage;
using FlowPilot.Domain.Enums;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;

namespace FlowPilot.Infrastructure.FileStorage;

internal static class Startup
{
    internal static IServiceCollection AddFileStorage(this IServiceCollection services, IConfiguration config)
    {
        var settingsSection = config.GetSection(nameof(FileStorageSettings));
        var settings = settingsSection.Get<FileStorageSettings>();

        if (settings is null)
            throw new InvalidOperationException("FileStorageSettings configuration is missing.");

        services.Configure<FileStorageSettings>(settingsSection);

        switch (settings.Provider?.Trim().ToLowerInvariant())
        {
            case "aws":
                services.Configure<AmazonS3Settings>(
                    settingsSection.GetSection(nameof(AmazonS3Settings)));

                services.AddTransient<IFileStorageService, AwsFileStorageService>();
                break;

            case "localstorage":
            default:
                services.AddTransient<IFileStorageService, LocalFileStorageService>();
                break;
        }

        return services;
    }

    internal static IApplicationBuilder UseFileStorage(this IApplicationBuilder app, IConfiguration config)
    {
        var settings = config
            .GetSection(nameof(FileStorageSettings))
            .Get<FileStorageSettings>();

        if (settings is null)
            return app;

        if (!string.Equals(settings.Provider, "LocalStorage", StringComparison.OrdinalIgnoreCase))
            return app;

        string rootFolder = FolderTypes.RootFolder.GetDescription();
        string filePath = Path.Combine(Directory.GetCurrentDirectory(), rootFolder);

        if (!Directory.Exists(filePath))
        {
            Directory.CreateDirectory(filePath);
        }

        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(filePath),
            RequestPath = "/" + rootFolder
        });

        return app;
    }
}
