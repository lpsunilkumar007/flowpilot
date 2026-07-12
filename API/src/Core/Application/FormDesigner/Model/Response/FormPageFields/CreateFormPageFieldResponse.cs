using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.FormDesigner.Model.Response.FormPageFields;
public class CreateFormPageFieldResponse
{
    [Required]
    public required DefaultIdType Id { get; set; }

    [Required]
    public required string Message { get; set; }
}
