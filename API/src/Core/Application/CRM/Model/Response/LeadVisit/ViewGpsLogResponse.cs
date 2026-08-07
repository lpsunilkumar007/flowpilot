using FlowPilot.Domain.Enums.CRM;

namespace FlowPilot.Application.CRM.Model.Response.LeadVisit;

public class ViewGpsLogResponse
{
    public DefaultIdType Id { get; set; }

    public decimal Latitude { get; set; }

    public decimal Longitude { get; set; }

    public DateTimeOffset LoggedAt { get; set; }

    public decimal? DistanceMeters { get; set; }

    public VerificationStatus? Status { get; set; }
}
