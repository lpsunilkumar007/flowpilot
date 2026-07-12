using System.Net;

namespace FlowPilot.Application.Common.Exceptions;
public class CustomNotImplementedException : CustomException
{
    public CustomNotImplementedException(string message, List<string>? errors = default)
        : base(message, errors, HttpStatusCode.NotImplemented)
    {
    }
}