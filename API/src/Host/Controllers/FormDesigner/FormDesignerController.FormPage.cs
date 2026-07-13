using FlowPilot.Application.Common.Models;
using FlowPilot.Application.FormDesigner.Model.Request.FormPages;
using FlowPilot.Application.FormDesigner.Model.Response.FormPages;

namespace FlowPilot.Host.Controllers.FormDesigner;

public partial class FormDesignerController
{

    [HttpPost("create-new-form-page")]
    [OpenApiOperation("Create a new form page", "")]
    [MustHavePermission(SystemAction.Create, SystemResource.ManageForm)]
    public async Task<CreateFormPageResponse> CreateFormPage(CreateFormPageRequest request)
    {
        return await _formPageService.CreateFormPage(request);
    }

    [HttpGet("get-form-page/{id}")]
    [OpenApiOperation("Get form page detail by id", "")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageForm)]
    public async Task<ViewFormPageDetailResponse> GetFormPageById(DefaultIdType id)
    {
        return await _formPageService.GetFormPageById(id);
    }

    [HttpDelete("delete-form-page/{id}")]
    [OpenApiOperation("Delete a page.", "")]
    [MustHavePermission(SystemAction.Delete, SystemResource.ManageForm)]
    public async Task<string> DeleteFormPage(DefaultIdType id)
    {
        return await _formPageService.DeleteFormPage(id);
    }

    [HttpPost("get-form-pages")]
    [OpenApiOperation("Get form pages details", "")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageForm)]
    public async Task<PaginationResponse<ViewFormPageDetailResponse>> GetFormPages(SearchFormPageRequest request)
    {
        return await _formPageService.GetFormPages(request);
    }

    [HttpPut("update-form-page")]
    [OpenApiOperation("Update form page detail", "")]
    [MustHavePermission(SystemAction.Update, SystemResource.ManageForm)]
    public async Task<string> UpdateFormPage(UpdateFormPageRequest request)
    {
        return await _formPageService.UpdateFormPage(request);
    }
}
