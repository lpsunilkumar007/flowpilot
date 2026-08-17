using FlowPilot.Application.Import.Core.Contracts;
using FlowPilot.Application.Import.Core.Definitions;

namespace FlowPilot.Application.Import.Core;

public interface IImportProvider
{
    string Key { get; }

    ImportDefinition GetDefinition();

    Task<IReadOnlyList<ImportParsedRow>> ParseAsync(
        IReadOnlyList<ImportFileRow> rows,
        CancellationToken cancellationToken);

    Task<SubmitImportResponse> SubmitAsync(
        IReadOnlyList<ImportParsedRow> rows,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<IReadOnlyDictionary<string, string>>> ExportAsync(CancellationToken cancellationToken);
}
