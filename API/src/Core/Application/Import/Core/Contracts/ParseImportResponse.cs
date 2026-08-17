namespace FlowPilot.Application.Import.Core.Contracts;

public sealed class ParseImportResponse
{
    public int TotalRows { get; set; }

    public int ValidRows { get; set; }

    public int InvalidRows { get; set; }

    public List<ImportParsedRow> Rows { get; set; } = [];
}
