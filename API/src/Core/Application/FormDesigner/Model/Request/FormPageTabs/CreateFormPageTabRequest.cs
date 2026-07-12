using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.FormDesigner.Model.Request.FormPageTabs;
public class CreateFormPageTabRequest
{
    [Required]
    public required DefaultIdType FKFormPagePKId { get; set; }

    public DefaultIdType? FKFormPageTabPKId { get; set; }

    [Required]
    public required string Name { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [Range(1, int.MaxValue, ErrorMessage = ValidationMessages.RequiredMessage)]
    public required int DisplayOrder { get; set; }
}
