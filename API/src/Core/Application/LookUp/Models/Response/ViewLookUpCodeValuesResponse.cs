namespace FlowPilot.Application.LookUp.Models.Response;
public class ViewLookUpCodeValuesResponse
{
    public int Id { get; set; }
    public required string LookUpValue { get; set; }

    public required int DisplayOrder { get; set; }

    public required bool IsActive { get; set; }
}
