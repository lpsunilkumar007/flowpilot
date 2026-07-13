using FlowPilot.Application.FormDesigner;
using FlowPilot.Host.Controllers.BaseControllers;

namespace FlowPilot.Host.Controllers.FormDesigner;

public partial class FormDesignerController : VersionNeutralApiController
{
    private readonly IFormStructureService _formStructureService;
    private readonly IFormPageService _formPageService;
    private readonly IFormPageTabService _formPageTabService;
    private readonly IFormPageFieldService _formPageFieldService;

    public FormDesignerController(IFormStructureService formStructureService, IFormPageService formPageService, IFormPageTabService formPageTabService, IFormPageFieldService formPageFieldService  )
    {
        _formStructureService = formStructureService;
        _formPageService = formPageService;
        _formPageTabService = formPageTabService;
        _formPageFieldService = formPageFieldService;
    }
}
