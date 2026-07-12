using FlowPilot.Application.Common.Models;

namespace FlowPilot.Application.LookUp.Models.Request;
public class SearchLookUpCodeValuesRequest : SearchRequestBaseClass
{
    public LookUpCodeTypes Type { get; set; }
}
