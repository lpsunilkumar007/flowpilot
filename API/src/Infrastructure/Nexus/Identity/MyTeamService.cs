using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Application.Nexus.Identity.Users;
using FlowPilot.Application.Nexus.Identity.Users.Models.Response;
using FlowPilot.Domain.Enums.CRM;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Infrastructure.Persistence.Context.Nexus;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Nexus.Identity;

internal class MyTeamService : IMyTeamService
{
    private readonly IReportingHierarchyService _reportingHierarchyService;
    private readonly NexusDbContext _nexusDbContext;
    private readonly ApplicationDbContext _applicationDbContext;
    private readonly IDateTimeService _dateTimeService;

    public MyTeamService(
        IReportingHierarchyService reportingHierarchyService,
        NexusDbContext nexusDbContext,
        ApplicationDbContext applicationDbContext,
        IDateTimeService dateTimeService)
    {
        _reportingHierarchyService = reportingHierarchyService;
        _nexusDbContext = nexusDbContext;
        _applicationDbContext = applicationDbContext;
        _dateTimeService = dateTimeService;
    }

    public async Task<MyTeamSummaryResponse> GetSummaryAsync(CancellationToken cancellationToken = default)
    {
        var distances = await _reportingHierarchyService.GetReportDistancesAsync(cancellationToken);
        int direct = distances.Count(x => x.Value == 1);
        int indirect = distances.Count(x => x.Value > 1);

        return new MyTeamSummaryResponse
        {
            HasReports = distances.Count > 0,
            DirectCount = direct,
            IndirectCount = indirect,
        };
    }

    public async Task<List<MyTeamMemberResponse>> GetMembersAsync(CancellationToken cancellationToken = default)
    {
        var distances = await _reportingHierarchyService.GetReportDistancesAsync(cancellationToken);
        if (distances.Count == 0)
        {
            return [];
        }

        var userIds = distances.Keys.ToList();
        var users = await _nexusDbContext.Users
            .AsNoTracking()
            .Where(u => userIds.Contains(u.Id))
            .Select(u => new { u.Id, u.FirstName, u.LastName, u.Email, u.IsActive })
            .ToListAsync(cancellationToken);

        return users
            .Select(u => new MyTeamMemberResponse
            {
                UserId = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                IsActive = u.IsActive,
                Relation = distances[u.Id] == 1 ? MyTeamRelation.Direct : MyTeamRelation.Indirect,
            })
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .ToList();
    }

    public async Task<MyTeamStatsResponse> GetStatsAsync(MyTeamRelation relation, CancellationToken cancellationToken = default)
    {
        var distances = await _reportingHierarchyService.GetReportDistancesAsync(cancellationToken);
        var memberIds = distances
            .Where(x => relation == MyTeamRelation.Direct ? x.Value == 1 : x.Value > 1)
            .Select(x => x.Key)
            .ToList();

        if (memberIds.Count == 0)
        {
            return new MyTeamStatsResponse();
        }

        var leadRows = await _applicationDbContext.Leads
            .AsNoTracking()
            .Where(l => !l.IsArchived && memberIds.Contains(l.FKAssignedToUserId))
            .Select(l => new { l.FKAssignedToUserId, l.FKLeadStatusId, StatusName = l.LeadStatus.LookUpValue, l.InterestLevel })
            .ToListAsync(cancellationToken);

        var memberGuids = memberIds
            .Select(id => Guid.TryParse(id, out var g) ? g : (Guid?)null)
            .Where(g => g.HasValue)
            .Select(g => g!.Value)
            .ToList();

        var today = _dateTimeService.UtcNow;
        var taskRows = await _applicationDbContext.Tasks
            .AsNoTracking()
            .Where(t => memberGuids.Contains(t.CreatedBy))
            .Select(t => new { t.CreatedBy, t.IsCompleted, t.When })
            .ToListAsync(cancellationToken);

        var leadStatus = leadRows
            .GroupBy(x => new { x.FKLeadStatusId, x.StatusName })
            .Select(g => new MyTeamStatsSliceResponse
            {
                Key = g.Key.FKLeadStatusId.ToString(),
                Label = g.Key.StatusName,
                Count = g.Select(x => x.FKAssignedToUserId).Distinct().Count(),
                MemberIds = g.Select(x => x.FKAssignedToUserId).Distinct().ToList(),
            })
            .OrderByDescending(x => x.Count)
            .ToList();

        var leadInterest = Enum.GetValues<InterestLevel>()
            .Select(level =>
            {
                var ids = leadRows.Where(x => x.InterestLevel == level).Select(x => x.FKAssignedToUserId).Distinct().ToList();
                return new MyTeamStatsSliceResponse
                {
                    Key = level.ToString(),
                    Label = level.ToString(),
                    Count = ids.Count,
                    MemberIds = ids,
                };
            })
            .Where(x => x.Count > 0)
            .ToList();

        string GuidToUserId(Guid createdBy) =>
            memberIds.FirstOrDefault(id => Guid.TryParse(id, out var g) && g == createdBy) ?? createdBy.ToString();

        var openIds = taskRows.Where(t => !t.IsCompleted && t.When >= today).Select(t => GuidToUserId(t.CreatedBy)).Distinct().ToList();
        var completedIds = taskRows.Where(t => t.IsCompleted).Select(t => GuidToUserId(t.CreatedBy)).Distinct().ToList();
        var overdueIds = taskRows.Where(t => !t.IsCompleted && t.When < today).Select(t => GuidToUserId(t.CreatedBy)).Distinct().ToList();

        var taskProgress = new List<MyTeamStatsSliceResponse>();
        if (openIds.Count > 0)
        {
            taskProgress.Add(new MyTeamStatsSliceResponse { Key = "Open", Label = "Open", Count = openIds.Count, MemberIds = openIds });
        }

        if (completedIds.Count > 0)
        {
            taskProgress.Add(new MyTeamStatsSliceResponse { Key = "Completed", Label = "Completed", Count = completedIds.Count, MemberIds = completedIds });
        }

        if (overdueIds.Count > 0)
        {
            taskProgress.Add(new MyTeamStatsSliceResponse { Key = "Overdue", Label = "Overdue", Count = overdueIds.Count, MemberIds = overdueIds });
        }

        return new MyTeamStatsResponse
        {
            LeadStatus = leadStatus,
            TaskProgress = taskProgress,
            LeadInterest = leadInterest,
        };
    }
}
