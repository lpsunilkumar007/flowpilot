using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.CRM.Model.Request.Lead;

public class AssignLeadRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string AssignedToUserId { get; set; }

    public string? Remarks { get; set; }
}
