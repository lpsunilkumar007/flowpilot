using FlowPilot.Application.Common.Interfaces;

namespace FlowPilot.Infrastructure.Common.Services;

public class DateTimeService : IDateTimeService
{
    public DateTimeOffset UtcNow
    {
        get
        {
            return DateTimeOffset.Now.ToUniversalTime();
        }
    }

    public DateTimeOffset ConvertToUTCDate(DateTimeOffset DateTimeOffset)
    {
        return DateTimeOffset.ToUniversalTime();
    }
}

public static class DateTimeOffsetService2
{

    public static DateTimeOffset UtcNow
    {
        get
        {
            return DateTimeOffset.UtcNow;
        }
    }
}
