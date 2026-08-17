using FlowPilot.Application.Import.Core.Contracts;

namespace FlowPilot.Application.Import.Core;

public interface IImportFileReader
{
    Task<IReadOnlyList<ImportFileRow>> ReadAsync(Stream stream, string fileName, CancellationToken cancellationToken);
}
