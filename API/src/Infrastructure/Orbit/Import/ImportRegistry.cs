using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Import.Core;
using FlowPilot.Application.Import.Core.Definitions;

namespace FlowPilot.Infrastructure.Orbit.Import;

public sealed class ImportRegistry : IImportRegistry
{
    private readonly IReadOnlyDictionary<string, IImportProvider> _providers;

    public ImportRegistry(IEnumerable<IImportProvider> providers)
    {
        _providers = providers.ToDictionary(x => x.Key, StringComparer.OrdinalIgnoreCase);
    }

    public IImportProvider Get(string entityKey)
    {
        if (string.IsNullOrWhiteSpace(entityKey) || !_providers.TryGetValue(entityKey.Trim(), out var provider))
        {
            throw new NotFoundException($"Import entity '{entityKey}' was not found.");
        }

        return provider;
    }

    public IReadOnlyList<ImportDefinition> GetDefinitions() =>
        _providers.Values
            .Select(x => x.GetDefinition())
            .OrderBy(x => x.RecommendedOrder)
            .ThenBy(x => x.Name)
            .ToList();
}
