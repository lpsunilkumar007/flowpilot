namespace FlowPilot.Host.Controllers.BaseControllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class BaseApiController : ControllerBase
{
}
