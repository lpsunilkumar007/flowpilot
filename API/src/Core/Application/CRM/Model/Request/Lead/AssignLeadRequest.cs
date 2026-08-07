using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.CRM.Model.Request.Lead;

public class AssignLeadRequest
{
    public bool AssignToYourself { get; set; }

    [RequiredIf(nameof(AssignToYourself), false)]
    public string? AssignedToUserId { get; set; }

    public string? Remarks { get; set; }
}
