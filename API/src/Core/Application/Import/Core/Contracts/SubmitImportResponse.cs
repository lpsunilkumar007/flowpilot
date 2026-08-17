namespace FlowPilot.Application.Import.Core.Contracts;

public sealed class SubmitImportResponse
{
    public int Inserted { get; set; }

    public int Updated { get; set; }

    public int Failed { get; set; }

    public List<ImportSubmitRowResult> Results { get; set; } = [];
}
