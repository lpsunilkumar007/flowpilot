using FlowPilot.Domain.Enums;

namespace FlowPilot.Domain.LookUp;

public class LookUpCodes : AuditableEntity
{
    public required LookUpCodeTypes LookUpCodeType { get; set; }

    public string? Description { get; set; }

    public virtual ICollection<LookUpCodeValues> LookUpCodeValues { get; set; }
}
