using Asp.Versioning;

namespace FlowPilot.Host.Controllers.BaseControllers;

[Route("api/[controller]")]
[ApiVersionNeutral]
public class VersionNeutralApiController : BaseApiController
{
}