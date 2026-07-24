namespace FlowPilot.Application.CRM.Model.Response.Task;

public class CreateTaskResponse
{
    public DefaultIdType Id { get; set; }

    public Guid Uuid { get; set; }

    public string Message { get; set; } = string.Empty;
}
