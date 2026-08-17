namespace FlowPilot.Application.Import.Core.Contracts;

public sealed class ImportFile
{
    public Stream Content { get; set; } = Stream.Null;

    public string ContentType { get; set; } = "text/csv";

    public string FileName { get; set; } = string.Empty;
}
