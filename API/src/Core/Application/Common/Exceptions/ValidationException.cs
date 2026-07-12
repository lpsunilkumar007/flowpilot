namespace FlowPilot.Application.Common.Exceptions;

public class ValidationException : CustomException
{
    public ValidationException(string message)
        : base(message, null, System.Net.HttpStatusCode.BadRequest) { }
} 