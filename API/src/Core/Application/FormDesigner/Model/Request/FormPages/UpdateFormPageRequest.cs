using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.FormDesigner.Model.Request.FormPages;
public class UpdateFormPageRequest
{
    [Required]
    public required DefaultIdType Id { get; set; }

    [Required]
    public required string Title { get; set; }

    public string? Description { get; set; }

    public string? IntroText { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [Range(1, int.MaxValue, ErrorMessage = ValidationMessages.RequiredMessage)]
    public required int DisplayOrder { get; set; }
}
