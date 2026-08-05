namespace FlowPilot.Application.Nexus.Identity.Users.Models.Response;

public enum MyTeamRelation
{
    Direct = 1,
    Indirect = 2,
}

public class MyTeamSummaryResponse
{
    public bool HasReports { get; set; }

    public int DirectCount { get; set; }

    public int IndirectCount { get; set; }
}

public class MyTeamMemberResponse
{
    public required string UserId { get; set; }

    public required string FirstName { get; set; }

    public required string LastName { get; set; }

    public string? Email { get; set; }

    public bool IsActive { get; set; }

    public MyTeamRelation Relation { get; set; }
}

public class MyTeamStatsSliceResponse
{
    public required string Key { get; set; }

    public required string Label { get; set; }

    public int Count { get; set; }

    public List<string> MemberIds { get; set; } = [];
}

public class MyTeamStatsResponse
{
    public List<MyTeamStatsSliceResponse> LeadStatus { get; set; } = [];

    public List<MyTeamStatsSliceResponse> TaskProgress { get; set; } = [];

    public List<MyTeamStatsSliceResponse> LeadInterest { get; set; } = [];
}
