using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.CRM;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.CRM.Model.Request.Lead;

public class UpdateLeadStatusRequest
{
    [Required]
    public required LeadStatus LeadStatus { get; set; }

    public string? Remarks { get; set; }
}
