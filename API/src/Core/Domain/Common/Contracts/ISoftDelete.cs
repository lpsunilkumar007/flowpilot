namespace FlowPilot.Domain.Common.Contracts;

public interface ISoftDelete
{
    bool IsDeleted { get; set; }
    DateTimeOffset? DeletedOn { get; set; }
    Guid? FKDeletedBy { get; set; }
}
