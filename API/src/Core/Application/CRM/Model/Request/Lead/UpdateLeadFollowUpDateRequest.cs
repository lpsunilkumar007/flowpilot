using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.CRM.Model.Request.Lead;

public class UpdateLeadFollowUpDateRequest
{
    [Required]
    public required DateTimeOffset NextFollowUpDate { get; set; }
}
