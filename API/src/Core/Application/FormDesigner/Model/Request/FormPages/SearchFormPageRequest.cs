using System.ComponentModel.DataAnnotations;
using FlowPilot.Application.Common.Models;

namespace FlowPilot.Application.FormDesigner.Model.Request.FormPages;
public class SearchFormPageRequest : SearchRequestBaseClass
{
    [Required]
    public required DefaultIdType FKFormStructurePKId { get; set; }
}
