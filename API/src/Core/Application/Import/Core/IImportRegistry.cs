using FlowPilot.Application.Import.Core.Definitions;

namespace FlowPilot.Application.Import.Core;

public interface IImportRegistry
{
    IImportProvider Get(string entityKey);

    IReadOnlyList<ImportDefinition> GetDefinitions();
}
