namespace FlowPilot.Application.Common.Models;
public class SearchRequestBaseClass
{
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public string? sortOrder { get; set; }
    public string? sortField { get; set; }

}
