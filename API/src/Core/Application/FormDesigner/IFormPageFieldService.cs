using FlowPilot.Application.FormDesigner.Model.Request.FormPageFields;
using FlowPilot.Domain.FormDesigner;

namespace FlowPilot.Application.FormDesigner;
public interface IFormPageFieldService : ITransientService
{
    T GetCreateFormPageFieldRequest<T>(GetFormPageFieldModelsRequest request, FormPageFields? entity = null);

    Task<T> CreateUpdateFormPageFieldAsync<T>(T request, DefaultIdType id);

    Task<T> GetFormPageFieldDetailByIdAsync<T>(DefaultIdType id);

    Task<string> DeleteFormPageField(DefaultIdType id);
}
