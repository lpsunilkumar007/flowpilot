using System.Text;
using FlowPilot.Application.Import.Core;
using FlowPilot.Application.Import.Core.Definitions;

namespace FlowPilot.Infrastructure.Orbit.Import.Readers;

public sealed class CsvImportFileWriter : IImportFileWriter
{
    public Stream Write(IReadOnlyList<ImportColumnDefinition> columns, IEnumerable<IReadOnlyDictionary<string, string>> rows)
    {
        var stream = new MemoryStream();
        using (var writer = new StreamWriter(stream, new UTF8Encoding(encoderShouldEmitUTF8Identifier: true), leaveOpen: true))
        {
            writer.WriteLine(string.Join(',', columns.Select(column => Escape(column.Header))));

            foreach (var row in rows)
            {
                var values = columns.Select(column =>
                {
                    row.TryGetValue(column.Key, out var value);
                    return Escape(value ?? string.Empty);
                });
                writer.WriteLine(string.Join(',', values));
            }
        }

        stream.Position = 0;
        return stream;
    }

    private static string Escape(string value)
    {
        if (value.Contains('"') || value.Contains(',') || value.Contains('\n') || value.Contains('\r'))
        {
            return $"\"{value.Replace("\"", "\"\"", StringComparison.Ordinal)}\"";
        }

        return value;
    }
}
