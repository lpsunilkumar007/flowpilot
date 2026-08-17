using FlowPilot.Application.Import.Core.Contracts;
using FlowPilot.Application.Import.Core.Definitions;

namespace FlowPilot.Application.Import;

public interface IImportService : ITransientService
{
    Task<IReadOnlyList<ImportDefinition>> GetDefinitionsAsync(CancellationToken cancellationToken);

    Task<ImportFile> GetTemplateAsync(string entityKey, CancellationToken cancellationToken);

    Task<ParseImportResponse> ParseAsync(
        string entityKey,
        Stream stream,
        string fileName,
        CancellationToken cancellationToken);

    Task<SubmitImportResponse> SubmitAsync(
        string entityKey,
        SubmitImportRequest request,
        CancellationToken cancellationToken);

    Task<ImportFile> ExportAsync(string entityKey, CancellationToken cancellationToken);
}
