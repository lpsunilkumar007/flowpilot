using FlowPilot.Domain.Common.Contracts;
using FlowPilot.Domain.Enums.Nexus;

namespace FlowPilot.Infrastructure.Nexus.LookUp.DbModels;

public class NexusLookUpCodes : AuditableEntity
{
    public required NexusLookUpCodeTypes LookUpCodeType { get; set; }

    public string? Description { get; set; }

    public virtual ICollection<NexusLookUpCodeValues> NexusLookUpCodeValues { get; set; }
}
