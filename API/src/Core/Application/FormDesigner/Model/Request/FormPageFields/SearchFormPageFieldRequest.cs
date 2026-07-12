using System.ComponentModel.DataAnnotations;
using FlowPilot.Application.Common.Models;

namespace FlowPilot.Application.FormDesigner.Model.Request.FormPageFields;
public class SearchFormPageFieldRequest : SearchRequestBaseClass
{
    [Required]
    public required DefaultIdType FKFormPagePKId { get; set; }
}
