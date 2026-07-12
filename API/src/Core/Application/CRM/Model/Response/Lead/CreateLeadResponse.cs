using FlowPilot.Domain.Enums.CRM;

namespace FlowPilot.Application.CRM.Model.Response.Lead;

public class CreateLeadResponse
{
    public DefaultIdType Id { get; set; }

    public string Message { get; set; } = string.Empty;
}
