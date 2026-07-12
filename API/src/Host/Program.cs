using FlowPilot.Infrastructure;
using Serilog;
using FlowPilot.Infrastructure.Common;
using FlowPilot.Infrastructure.Logging.Serilog;
using FlowPilot.Host.FlowPilot.Host.Configurations;
using FlowPilot.Infrastructure.Json;

//[assembly: ApiConventionType(typeof(FSHApiConventions))]

StaticLogger.EnsureInitialized();
Log.Information("Server Booting Up...");

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.AddConfigurations().RegisterSerilog();
    builder.Services.AddControllers().SetJsonSerializerOptions();
    builder.Services.AddInfrastructure(builder.Configuration);
    //builder.Services.AddApplication();

    var app = builder.Build();

    await app.Services.InitializeDatabasesAsync();

    app.UseInfrastructure(builder.Configuration);
    app.MapEndpoints();
    app.Run();
}
catch (Exception ex) when (!ex.GetType().Name.Equals("HostAbortedException", StringComparison.Ordinal))
{
    StaticLogger.EnsureInitialized();
    Log.Fatal(ex, "Unhandled exception");
}
finally
{
    StaticLogger.EnsureInitialized();
    Log.Information("Server Shutting down...");
    Log.CloseAndFlush();
}