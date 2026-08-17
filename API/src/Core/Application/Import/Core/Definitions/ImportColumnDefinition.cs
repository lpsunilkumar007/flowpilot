namespace FlowPilot.Application.Import.Core.Definitions;

public sealed class ImportColumnDefinition
{
    public string Key { get; set; } = string.Empty;

    public string Header { get; set; } = string.Empty;

    public bool Required { get; set; }

    public ImportColumnDataType DataType { get; set; } = ImportColumnDataType.Text;

    public string? LookupHint { get; set; }

    public string? Sample { get; set; }

    public List<string> Aliases { get; set; } = [];
}
