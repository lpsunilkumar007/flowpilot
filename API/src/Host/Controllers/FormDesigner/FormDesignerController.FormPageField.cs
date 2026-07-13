using FlowPilot.Application.FormDesigner.Model.Request.FormPageFields;
using FlowPilot.Application.FormDesigner.Model.Request.FormPageFields.FormPageFieldTypeModels;

namespace FlowPilot.Host.Controllers.FormDesigner;

public partial class FormDesignerController
{
    #region Get Control Models
    [HttpPost("get-number-form-field-details")]
    [OpenApiOperation("Get 'Number' Field details", "")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageForm)]
    public CreateFormPageFieldNumberRequest GetNumberFormFieldDetail(GetFormPageFieldModelsRequest request)
    {
        return _formPageFieldService.GetCreateFormPageFieldRequest<CreateFormPageFieldNumberRequest>(request);
    }

    [HttpPost("get-select-form-field-details")]
    [OpenApiOperation("Get 'Select' Field details", "")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageForm)]
    public CreateFormPageFieldSelectRequest GetSelectFormFieldDetail(GetFormPageFieldModelsRequest request)
    {
        return _formPageFieldService.GetCreateFormPageFieldRequest<CreateFormPageFieldSelectRequest>(request);
    }
    #endregion

    #region Create Control Models
    [HttpPost("create-number-form-field/{id}")]
    [MustHavePermission(SystemAction.Create, SystemResource.ManageForm)]
    [OpenApiOperation("Get 'Number' Field details", "")]
    public async Task<CreateFormPageFieldNumberRequest> CreateUpdateNumberFormFieldDetail([FromBody] CreateFormPageFieldNumberRequest request, DefaultIdType id)
    {
        return await _formPageFieldService.CreateUpdateFormPageFieldAsync(request, id);
    }

    [HttpPost("create-select-form-field/{id}")]
    [MustHavePermission(SystemAction.Create, SystemResource.ManageForm)]
    [OpenApiOperation("Create 'Select' Field details", "")]
    public async Task<CreateFormPageFieldSelectRequest> CreateUpdateSelectFormFieldDetail([FromBody] CreateFormPageFieldSelectRequest request, DefaultIdType id)
    {
        return await _formPageFieldService.CreateUpdateFormPageFieldAsync(request, id);
    }
    #endregion

    #region Get Control Details by Id

    [HttpGet("get-number-form-field-details/{id}")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageForm)]
    [OpenApiOperation("Get 'Number' Field details", "")]
    public async Task<CreateFormPageFieldNumberRequest> GetNumberFormFieldDetail(DefaultIdType id)
    {
        return await _formPageFieldService.GetFormPageFieldDetailByIdAsync<CreateFormPageFieldNumberRequest>(id);
    }

    [HttpGet("get-select-form-field-details/{id}")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageForm)]
    [OpenApiOperation("Get 'Select' Field details", "")]
    public async Task<CreateFormPageFieldSelectRequest> GetSelectFormFieldDetail(DefaultIdType id)
    {
        return await _formPageFieldService.GetFormPageFieldDetailByIdAsync<CreateFormPageFieldSelectRequest>(id);
    }

    #endregion

    [HttpDelete("delete-form-page-field/{id}")]
    [OpenApiOperation("Delete a form page field.", "")]
    [MustHavePermission(SystemAction.Delete, SystemResource.ManageForm)]
    public async Task<string> DeleteFormPageField(DefaultIdType id)
    {
        return await _formPageFieldService.DeleteFormPageField(id);
    }

}
