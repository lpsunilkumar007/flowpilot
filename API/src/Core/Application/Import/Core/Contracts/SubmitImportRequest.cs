namespace FlowPilot.Application.Import.Core.Contracts;

public sealed class SubmitImportRequest
{
    public List<ImportParsedRow> Rows { get; set; } = [];
}
