using FlowPilot.Application.Import.Core;
using FlowPilot.Infrastructure.Orbit.Import.Providers;
using FlowPilot.Infrastructure.Orbit.Import.Readers;
using Microsoft.Extensions.DependencyInjection;

namespace FlowPilot.Infrastructure.Orbit.Import;

internal static class Startup
{
    internal static IServiceCollection AddImports(this IServiceCollection services)
    {
        services.AddTransient<IImportRegistry, ImportRegistry>();
        services.AddTransient<IImportFileReader, CsvImportFileReader>();
        services.AddTransient<IImportFileWriter, CsvImportFileWriter>();
        services.AddTransient<IImportProvider, LeadImportProvider>();
        return services;
    }
}
