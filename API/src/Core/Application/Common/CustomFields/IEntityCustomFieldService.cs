using FlowPilot.Application.Common.CustomFields.Model.Request;
using FlowPilot.Application.Common.CustomFields.Model.Response;
using FlowPilot.Domain.Enums.Common;

namespace FlowPilot.Application.Common.CustomFields;

public interface IEntityCustomFieldService : ITransientService
{
    Task<List<ViewEntityCustomFieldResponse>> GetByEntityAsync(
        EntityCustomFieldType entityType,
        DefaultIdType entityId,
        CancellationToken cancellationToken = default);

    Task<string> ReplaceForEntityAsync(
        ReplaceEntityCustomFieldsRequest request,
        CancellationToken cancellationToken = default);
}
