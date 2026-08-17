namespace FlowPilot.Application.Import.Core.Contracts;

public sealed class ImportFileRow
{
    public int RowNumber { get; set; }

    public Dictionary<string, string> Values { get; set; } = new(StringComparer.OrdinalIgnoreCase);
}
