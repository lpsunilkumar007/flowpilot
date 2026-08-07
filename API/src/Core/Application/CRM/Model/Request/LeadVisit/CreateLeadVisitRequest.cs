using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.CRM.Model.Request.LeadVisit;

public class CreateLeadVisitRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DefaultIdType FKLeadPKId { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required DateTimeOffset VisitTime { get; set; }

    public List<LogGpsRequest> GpsLogs { get; set; } = [];

    public List<AddLeadVisitImageRequest> Images { get; set; } = [];
}
