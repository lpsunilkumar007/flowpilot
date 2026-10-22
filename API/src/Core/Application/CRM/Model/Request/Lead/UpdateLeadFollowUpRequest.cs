using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.CRM;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.CRM.Model.Request.Lead;

public class UpdateLeadFollowUpRequest
{
    [Required]
    public required DateTimeOffset NextFollowUpDate { get; set; }

    [Required]
    [EnumDataType(typeof(FollowUpType), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required FollowUpType FollowUpType { get; set; }

    public string? ReminderNote { get; set; }
}
