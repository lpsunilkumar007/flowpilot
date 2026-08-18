using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.CRM;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.CRM.Model.Request.Campaign;

public class CreateCampaignRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string Title { get; set; }

    public CampaignType CampaignType { get; set; } = CampaignType.Email;

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public DefaultIdType OfferingId { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public DefaultIdType TemplateId { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public DateTimeOffset ScheduleDate { get; set; }

    public string? Message { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [MinLength(1, ErrorMessage = ValidationMessages.RequiredMessage)]
    public required List<DefaultIdType> LeadIds { get; set; }
}
