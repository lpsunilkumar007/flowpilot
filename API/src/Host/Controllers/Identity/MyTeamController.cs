using FlowPilot.Application.Nexus.Identity.Users;
using FlowPilot.Application.Nexus.Identity.Users.Models.Response;
using FlowPilot.Host.Controllers.BaseControllers;

namespace FlowPilot.Host.Controllers.Identity;

public class MyTeamController : VersionNeutralApiController
{
    private readonly IMyTeamService _myTeamService;

    public MyTeamController(IMyTeamService myTeamService) => _myTeamService = myTeamService;

    [HttpGet("summary")]
    [RequireAnyResource(SystemAction.View, [SystemResource.ManageLeads, SystemResource.ManageTasks])]
    [OpenApiOperation("Get whether the current user has direct or indirect reports.", "")]
    public Task<MyTeamSummaryResponse> GetSummaryAsync(CancellationToken cancellationToken)
    {
        return _myTeamService.GetSummaryAsync(cancellationToken);
    }

    [HttpGet]
    [RequireAnyResource(SystemAction.View, [SystemResource.ManageLeads, SystemResource.ManageTasks])]
    [OpenApiOperation("List direct and indirect team members for the current user.", "")]
    public Task<List<MyTeamMemberResponse>> GetMembersAsync(CancellationToken cancellationToken)
    {
        return _myTeamService.GetMembersAsync(cancellationToken);
    }

    [HttpGet("stats")]
    [RequireAnyResource(SystemAction.View, [SystemResource.ManageLeads, SystemResource.ManageTasks])]
    [OpenApiOperation("Aggregate lead/task status pies for Direct or Indirect reports.", "")]
    public Task<MyTeamStatsResponse> GetStatsAsync([FromQuery] MyTeamRelation relation, CancellationToken cancellationToken)
    {
        return _myTeamService.GetStatsAsync(relation, cancellationToken);
    }
}
