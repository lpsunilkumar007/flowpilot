using FlowPilot.Application.Common.Models;
using FlowPilot.Application.FormDesigner.Model.Request.FormPageTabs;
using FlowPilot.Application.FormDesigner.Model.Response.FormPageTabs;

namespace FlowPilot.Host.Controllers.FormDesigner;

public partial class FormDesignerController
{
    [HttpPost("create-new-form-page-tab")]
    [OpenApiOperation("Create a new form page tab", "")]
    [MustHavePermission(SystemAction.Create, SystemResource.ManageForm)]
    public async Task<CreateFormPageTabResponse> CreateFormPageTab(CreateFormPageTabRequest request)
    {
        return await _formPageTabService.CreateFormPageTab(request);
    }

    [HttpGet("get-form-page-tab/{id}")]
    [OpenApiOperation("Get form page tab detail by id", "")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageForm)]
    public async Task<ViewFormPageTabDetailResponse> GetFormPageTabById(DefaultIdType id)
    {
        return await _formPageTabService.GetFormPageTabById(id);
    }

    [HttpPost("get-form-page-tabs")]
    [OpenApiOperation("Get form page tabs details", "")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageForm)]
    public async Task<PaginationResponse<ViewFormPageTabDetailResponse>> GetFormPageTabs(SearchFormPageTabRequest request)
    {
        return await _formPageTabService.GetFormPageTabs(request);
    }

    [HttpPut("update-form-page-tab")]
    [OpenApiOperation("Update form page tab detail", "")]
    [MustHavePermission(SystemAction.Update, SystemResource.ManageForm)]
    public async Task<string> UpdateFormPageTab(UpdateFormPageTabRequest request)
    {
        return await _formPageTabService.UpdateFormPageTab(request);
    }

    [HttpDelete("delete-form-page-tab/{id}")]
    [OpenApiOperation("Delete a form page tab.", "")]
    [MustHavePermission(SystemAction.Delete, SystemResource.ManageForm)]
    public async Task<string> DeleteFormPagTab(DefaultIdType id)
    {
        return await _formPageTabService.DeleteFormPagTab(id);
    }
}
