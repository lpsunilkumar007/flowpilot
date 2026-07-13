using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using FlowPilot.Domain.Common.Contracts;

namespace FlowPilot.Infrastructure.Nexus.Identity.DbModels;
public class ApplicationUserTwoFactorSession : AuditableEntity
{
    public required Guid SessionId { get; set; }

    [ForeignKey(nameof(ApplicationUsers))]
    public required string FKApplicationUserPKId { get; set; }
    
    public virtual ApplicationUser ApplicationUsers { get; set; }

    public required  string Provider { get; set; }

    public required DateTimeOffset ExpiresAtUtc { get; set; }

    public required int Attempts { get; set; }

    public required bool Used { get; set; }

}
