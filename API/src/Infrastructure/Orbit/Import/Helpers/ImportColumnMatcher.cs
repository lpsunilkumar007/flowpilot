using FlowPilot.Application.Import.Core.Definitions;

namespace FlowPilot.Infrastructure.Orbit.Import.Helpers;

internal static class ImportColumnMatcher
{
    public static string Normalize(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var chars = value
            .Where(ch => !char.IsWhiteSpace(ch) && ch is not '_' and not '-' and not '*')
            .ToArray();

        return new string(chars).ToLowerInvariant();
    }

    public static Dictionary<string, string> MapRow(
        IReadOnlyList<ImportColumnDefinition> columns,
        IReadOnlyDictionary<string, string> rawValues)
    {
        var mapped = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var lookup = rawValues
            .GroupBy(x => Normalize(x.Key))
            .ToDictionary(g => g.Key, g => g.First().Value ?? string.Empty, StringComparer.OrdinalIgnoreCase);

        foreach (var column in columns)
        {
            mapped[column.Key] = FindValue(column, lookup);
        }

        return mapped;
    }

    private static string FindValue(ImportColumnDefinition column, IReadOnlyDictionary<string, string> lookup)
    {
        var candidates = new List<string>
        {
            Normalize(column.Header),
            Normalize(column.Key)
        };
        candidates.AddRange(column.Aliases.Select(Normalize));

        foreach (var candidate in candidates.Where(x => x.Length > 0).Distinct(StringComparer.OrdinalIgnoreCase))
        {
            if (lookup.TryGetValue(candidate, out var value))
            {
                return value.Trim();
            }
        }

        return string.Empty;
    }
}
