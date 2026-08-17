using FlowPilot.Application.Import.Core.Definitions;

namespace FlowPilot.Application.Import.Core;

public interface IImportFileWriter
{
    Stream Write(IReadOnlyList<ImportColumnDefinition> columns, IEnumerable<IReadOnlyDictionary<string, string>> rows);
}
