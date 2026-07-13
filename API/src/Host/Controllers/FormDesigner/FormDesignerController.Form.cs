using FlowPilot.Application.Common.Models;
using FlowPilot.Application.FormDesigner.Model.Request.FormStructure;
using FlowPilot.Application.FormDesigner.Model.Response.FormStructure;

namespace FlowPilot.Host.Controllers.FormDesigner;

public partial class FormDesignerController
{
    [HttpPost("create-new-form")]
    [MustHavePermission(SystemAction.Create, SystemResource.ManageForm)]
    [OpenApiOperation("Create a new form", "")]
    public async Task<CreateFormStructureResponse> CreateFormStructure(CreateFormStructureRequest request)
    {
        return await _formStructureService.CreateFormStructure(request);
    }

    [HttpGet("get-form/{id}")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageForm)]
    [OpenApiOperation("Get form detail by id", "")]
    public async Task<ViewFormStructureDetailResponse> GetFormStructureById(DefaultIdType id)
    {
        return await _formStructureService.GetFormStructureById(id);
    }

    [HttpPut("update-form")]
    [MustHavePermission(SystemAction.Update, SystemResource.ManageForm)]
    [OpenApiOperation("Update form detail", "")]
    public async Task<string> UpdateFormStructure(UpdateFormStructureRequest request)
    {
        return await _formStructureService.UpdateFormStructure(request);
    }

    [HttpPost("get-forms")]
    [OpenApiOperation("Get form details", "")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageForm)]
    public async Task<PaginationResponse<ViewFormStructureDetailResponse>> GetFormStructures(SearchFormStructureRequest request)
    {
        return await _formStructureService.GetFormStructures(request);
    }

    [HttpDelete("delete-form/{id}")]
    [MustHavePermission(SystemAction.Delete, SystemResource.ManageForm)]
    [OpenApiOperation("Delete a form.", "")]
    public async Task<string> DeleteFormStructure(DefaultIdType id)
    {
        return await _formStructureService.DeleteFormStructure(id);
    }

}
