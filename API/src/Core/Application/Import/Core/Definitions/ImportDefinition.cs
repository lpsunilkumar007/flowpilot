namespace FlowPilot.Application.Import.Core.Definitions;

public sealed class ImportDefinition
{
    public string Key { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int RecommendedOrder { get; set; }

    public string EntityResource { get; set; } = string.Empty;

    public List<ImportColumnDefinition> Columns { get; set; } = [];
}
