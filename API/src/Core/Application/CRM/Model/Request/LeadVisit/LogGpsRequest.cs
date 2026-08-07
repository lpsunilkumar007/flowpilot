using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.CRM.Model.Request.LeadVisit;

public class LogGpsRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public decimal Latitude { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public decimal Longitude { get; set; }

    public DateTimeOffset LoggedAt { get; set; }
}
