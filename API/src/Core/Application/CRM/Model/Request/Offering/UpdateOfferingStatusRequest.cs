using FlowPilot.Domain.Enums.CRM;

namespace FlowPilot.Application.CRM.Model.Request.Offering;

public class UpdateOfferingStatusRequest
{
    public OfferingStatus Status { get; set; }
}
