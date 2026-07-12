using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.FormDesigner.Model.Response.FormPages;
public class CreateFormPageResponse
{
    [Required]
    public required DefaultIdType Id { get; set; }

    [Required]
    public required string Message { get; set; }
}
