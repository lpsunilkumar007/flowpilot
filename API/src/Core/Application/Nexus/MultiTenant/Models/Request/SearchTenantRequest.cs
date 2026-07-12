using FlowPilot.Application.Common.Models;

namespace FlowPilot.Application.Nexus.MultiTenant.Models.Request;
public class SearchTenantRequest : SearchRequestBaseClass
{
    public string? FreeText { get; set; }

    public bool? IsActive { get; set; }
}
