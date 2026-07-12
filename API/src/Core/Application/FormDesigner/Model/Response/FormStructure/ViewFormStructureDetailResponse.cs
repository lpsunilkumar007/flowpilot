using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.FormDesigner;

namespace FlowPilot.Application.FormDesigner.Model.Response.FormStructure;
public class ViewFormStructureDetailResponse
{
    [Required]
    public required DefaultIdType Id { get; set; }

    [Required]
    public required string Name { get; set; }

    [Required]
    public required FormStatus FormStatus { get; set; }

    public string? Description { get; set; }

    public string? IntroductionText { get; set; }
}
