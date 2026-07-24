using System.ComponentModel.DataAnnotations;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.CRM.Model.Request.LeadVisit;

public class AddLeadVisitImageRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required FileUploadRequest Image { get; set; }

    public string? Caption { get; set; }
}
