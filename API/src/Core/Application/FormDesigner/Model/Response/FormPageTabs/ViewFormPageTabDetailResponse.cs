using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.FormDesigner.Model.Response.FormPageTabs;
public class ViewFormPageTabDetailResponse
{
    [Required]
    public required DefaultIdType Id { get; set; }

    [Required]
    public required DefaultIdType FKFormPagePKId { get; set; }
   
    public DefaultIdType? FKFormPageTabPKId { get; set; }

    [Required]
    public required string Name { get; set; }

    [Required]
    public required int DisplayOrder { get; set; }

    public string? ParentTabName { get; set; }
}
