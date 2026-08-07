using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.CRM.Model.Request.Lead;

public class UpdateLeadStatusRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DefaultIdType LeadStatusId { get; set; }

    public string? Remarks { get; set; }
}
