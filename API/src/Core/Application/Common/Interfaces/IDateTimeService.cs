namespace FlowPilot.Application.Common.Interfaces;

public interface IDateTimeService : ITransientService
{
    DateTimeOffset UtcNow { get; }

    DateTimeOffset ConvertToUTCDate(DateTimeOffset DateTimeOffset);
     
}
