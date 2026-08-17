namespace FlowPilot.Application.Import.Core.Contracts;

public sealed class ImportParsedRow
{
    public int RowNumber { get; set; }

    public Dictionary<string, string> Values { get; set; } = new(StringComparer.OrdinalIgnoreCase);

    public ImportRowAction Action { get; set; } = ImportRowAction.Insert;

    public bool IsValid { get; set; }

    public List<string> Errors { get; set; } = [];
}
