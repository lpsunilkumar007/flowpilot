using Microsoft.AspNetCore.Identity;

namespace FlowPilot.Infrastructure.Nexus.Identity.DbModels;
public class ApplicationRoleClaim : IdentityRoleClaim<string>
{
    public string? CreatedBy { get; init; }
    public DateTimeOffset CreatedOn { get; init; }
}
