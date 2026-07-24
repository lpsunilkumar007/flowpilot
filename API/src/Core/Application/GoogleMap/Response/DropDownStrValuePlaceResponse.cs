using FlowPilot.Application.GoogleMap.Response;

namespace FlowPilot.Application.GoogleMap.Request;

public class DropDownStrValuePlaceResponse : DropDownStrValueResponse
{
    public string City { get; set; }
    public string State { get; set; }
    public string PostalCode { get; set; }
    public double? Latitude { get; set; }
    public double? Longtitude { get; set; }
}

