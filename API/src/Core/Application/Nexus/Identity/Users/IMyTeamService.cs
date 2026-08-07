using FlowPilot.Application.Nexus.Identity.Users.Models.Response;

namespace FlowPilot.Application.Nexus.Identity.Users;

public interface IMyTeamService : ITransientService
{
    Task<MyTeamSummaryResponse> GetSummaryAsync(CancellationToken cancellationToken = default);

    Task<List<MyTeamMemberResponse>> GetMembersAsync(CancellationToken cancellationToken = default);

    Task<MyTeamStatsResponse> GetStatsAsync(MyTeamRelation relation, CancellationToken cancellationToken = default);
}
