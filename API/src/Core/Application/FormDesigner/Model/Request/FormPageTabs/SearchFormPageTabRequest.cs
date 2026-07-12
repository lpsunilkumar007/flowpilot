using System.ComponentModel.DataAnnotations;
using FlowPilot.Application.Common.Models;

namespace FlowPilot.Application.FormDesigner.Model.Request.FormPageTabs;
public class SearchFormPageTabRequest : SearchRequestBaseClass
{
    [Required]
    public required DefaultIdType FKFormPagePKId { get; set; }
}
