using FlowPilot.Application.Import.Core;
using FlowPilot.Application.Import.Core.Contracts;
using FlowPilot.Application.Import.Core.Definitions;
using FlowPilot.Infrastructure.Orbit.Import.Helpers;

namespace FlowPilot.Infrastructure.Orbit.Import.Providers;

public abstract class ImportProviderBase : IImportProvider
{
    public abstract string Key { get; }

    public abstract ImportDefinition GetDefinition();

    public abstract Task<IReadOnlyList<ImportParsedRow>> ParseAsync(
        IReadOnlyList<ImportFileRow> rows,
        CancellationToken cancellationToken);

    public abstract Task<SubmitImportResponse> SubmitAsync(
        IReadOnlyList<ImportParsedRow> rows,
        CancellationToken cancellationToken);

    public abstract Task<IReadOnlyList<IReadOnlyDictionary<string, string>>> ExportAsync(
        CancellationToken cancellationToken);

    protected ImportParsedRow CreateParsedRow(ImportFileRow fileRow, ImportDefinition definition)
    {
        return new ImportParsedRow
        {
            RowNumber = fileRow.RowNumber,
            Values = ImportColumnMatcher.MapRow(definition.Columns, fileRow.Values)
        };
    }

    protected ImportParsedRow CreateParsedRow(ImportParsedRow source, ImportDefinition definition)
    {
        return new ImportParsedRow
        {
            RowNumber = source.RowNumber,
            Values = ImportColumnMatcher.MapRow(definition.Columns, source.Values)
        };
    }

    protected static string GetValue(ImportParsedRow row, string key) =>
        row.Values.TryGetValue(key, out var value) ? value?.Trim() ?? string.Empty : string.Empty;

    protected static void AddError(ImportParsedRow row, string error) => row.Errors.Add(error);

    protected static void FinalizeRow(ImportParsedRow row) =>
        row.IsValid = row.Errors.Count == 0;

    protected static ImportDefinition BuildDefinition(
        string key,
        string name,
        string category,
        string description,
        int recommendedOrder,
        string entityResource,
        params ImportColumnDefinition[] columns) =>
        new()
        {
            Key = key,
            Name = name,
            Category = category,
            Description = description,
            RecommendedOrder = recommendedOrder,
            EntityResource = entityResource,
            Columns = columns.ToList()
        };

    protected static ImportColumnDefinition Column(
        string key,
        string header,
        bool required = false,
        ImportColumnDataType dataType = ImportColumnDataType.Text,
        string? lookupHint = null,
        string? sample = null,
        params string[] aliases) =>
        new()
        {
            Key = key,
            Header = header,
            Required = required,
            DataType = dataType,
            LookupHint = lookupHint,
            Sample = sample,
            Aliases = aliases.ToList()
        };
}
