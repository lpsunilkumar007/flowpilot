using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.FormDesigner.Model.Response.FormPages;
public class ViewFormPageDetailResponse
{
    [Required]
    public required DefaultIdType Id { get; set; }

    [Required]
    public required DefaultIdType FKFormStructurePKId { get; set; }

    [Required]
    public required string Title { get; set; }

    public string? Description { get; set; }

    public string? IntroText { get; set; }

    [Required]
    public required int DisplayOrder { get; set; }
}
