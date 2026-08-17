namespace FlowPilot.Application.Import.Core.Contracts;

public sealed class ImportSubmitRowResult
{
    public int RowNumber { get; set; }

    public ImportRowAction Action { get; set; }

    public bool Success { get; set; }

    public string? Error { get; set; }
}
