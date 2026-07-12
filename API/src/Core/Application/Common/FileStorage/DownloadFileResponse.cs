using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.Common.FileStorage;
public class DownloadFileResponse
{
    [Required]
    public required string Name { get; set; }

    [Required]
    public required string Extension { get; set; }

    [Required]
    public required string FileBase64String { get; set; }
}

