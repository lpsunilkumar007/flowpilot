using FlowPilot.Application.Common.Models;
using FlowPilot.Domain.Enums.CRM;

namespace FlowPilot.Application.CRM.Model.Request.Offering;

public class SearchOfferingRequest : SearchRequestBaseClass
{
    public string? SearchText { get; set; }

    public OfferingType? Type { get; set; }

    public OfferingStatus? Status { get; set; }

    public string? OwnerUserId { get; set; }
}
