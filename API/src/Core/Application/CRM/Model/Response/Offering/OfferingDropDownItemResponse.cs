namespace FlowPilot.Application.CRM.Model.Response.Offering;

public class OfferingDropDownItemResponse
{
    public DefaultIdType Value { get; set; }

    public Guid UniqueId { get; set; }

    public string Text { get; set; } = string.Empty;
}
