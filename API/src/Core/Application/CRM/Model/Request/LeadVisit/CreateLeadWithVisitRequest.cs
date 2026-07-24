using System.ComponentModel.DataAnnotations;
using FlowPilot.Application.CRM.Model.Request.Lead;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.CRM.Model.Request.LeadVisit;

public class CreateLeadWithVisitRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required CreateLeadRequest Lead { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset VisitTime { get; set; }

    public List<LogGpsRequest> GpsLogs { get; set; } = [];

    public List<AddLeadVisitImageRequest> Images { get; set; } = [];
}
