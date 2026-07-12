using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.FormDesigner;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.FormDesigner.Model.Request.FormPageFields;

public class GetFormPageFieldModelsRequest
{
    [Required]
    public required DefaultIdType FKFormPagePKId { get; set; }

    public DefaultIdType? FKFormPageFieldTabId { get; set; }

    [Required]
    public required FormPageFieldTypes FormPageFieldType { get; set; }

}


