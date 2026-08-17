using System.Text;
using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Import.Core;
using FlowPilot.Application.Import.Core.Contracts;

namespace FlowPilot.Infrastructure.Orbit.Import.Readers;

public sealed class CsvImportFileReader : IImportFileReader
{
    public Task<IReadOnlyList<ImportFileRow>> ReadAsync(Stream stream, string fileName, CancellationToken cancellationToken)
    {
        if (stream == null || stream.Length == 0)
        {
            throw new ValidationException("The uploaded file is empty.");
        }

        var extension = Path.GetExtension(fileName);
        if (!extension.Equals(".csv", StringComparison.OrdinalIgnoreCase))
        {
            throw new ValidationException("Only CSV (.csv) files are supported.");
        }

        using var reader = new StreamReader(stream, Encoding.UTF8, detectEncodingFromByteOrderMarks: true, bufferSize: 1024, leaveOpen: true);
        var headerLine = reader.ReadLine();
        if (string.IsNullOrWhiteSpace(headerLine))
        {
            throw new ValidationException("The uploaded file does not contain a header row.");
        }

        var headers = ParseCsvLine(headerLine);
        if (headers.Count == 0 || headers.All(string.IsNullOrWhiteSpace))
        {
            throw new ValidationException("The uploaded file does not contain a header row.");
        }

        var rows = new List<ImportFileRow>();
        var rowNumber = 1;
        while (!reader.EndOfStream)
        {
            cancellationToken.ThrowIfCancellationRequested();
            rowNumber++;
            var line = reader.ReadLine();
            if (line is null)
            {
                break;
            }

            if (string.IsNullOrWhiteSpace(line))
            {
                continue;
            }

            var fields = ParseCsvLine(line);
            var values = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            for (var i = 0; i < headers.Count; i++)
            {
                var header = headers[i]?.Trim() ?? string.Empty;
                if (string.IsNullOrWhiteSpace(header))
                {
                    continue;
                }

                values[header] = i < fields.Count ? fields[i] ?? string.Empty : string.Empty;
            }

            if (values.Values.All(string.IsNullOrWhiteSpace))
            {
                continue;
            }

            rows.Add(new ImportFileRow
            {
                RowNumber = rowNumber,
                Values = values
            });
        }

        return Task.FromResult<IReadOnlyList<ImportFileRow>>(rows);
    }

    private static List<string> ParseCsvLine(string line)
    {
        var fields = new List<string>();
        var current = new StringBuilder();
        var inQuotes = false;

        for (var i = 0; i < line.Length; i++)
        {
            var ch = line[i];
            if (inQuotes)
            {
                if (ch == '"')
                {
                    if (i + 1 < line.Length && line[i + 1] == '"')
                    {
                        current.Append('"');
                        i++;
                    }
                    else
                    {
                        inQuotes = false;
                    }
                }
                else
                {
                    current.Append(ch);
                }
            }
            else if (ch == '"')
            {
                inQuotes = true;
            }
            else if (ch == ',')
            {
                fields.Add(current.ToString());
                current.Clear();
            }
            else
            {
                current.Append(ch);
            }
        }

        fields.Add(current.ToString());
        return fields;
    }
}
