using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Application.Common.Mailing;
using FlowPilot.Application.Common.Models;
using FlowPilot.Application.CRM;
using FlowPilot.Application.CRM.Model.Request.Campaign;
using FlowPilot.Application.CRM.Model.Response.Campaign;
using FlowPilot.Application.Nexus.Identity.Users;
using FlowPilot.Application.Nexus.Identity.Users.Models.Response;
using FlowPilot.Domain.CRM;
using FlowPilot.Domain.Enums.CRM;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Infrastructure.SystemConstants;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Orbit.CRM;

public class CampaignService : ICampaignService
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;
    private readonly IReportingHierarchyService _reportingHierarchyService;
    private readonly IJobService _jobService;
    private readonly IMailService _mailService;
    private readonly IUserService _userService;

    public CampaignService(
        ApplicationDbContext db,
        ICurrentUser currentUser,
        IReportingHierarchyService reportingHierarchyService,
        IJobService jobService,
        IMailService mailService,
        IUserService userService)
    {
        _db = db;
        _currentUser = currentUser;
        _reportingHierarchyService = reportingHierarchyService;
        _jobService = jobService;
        _mailService = mailService;
        _userService = userService;
    }

    public async Task<PaginationResponse<ViewCampaignResponse>> SearchAsync(SearchCampaignRequest request, CancellationToken cancellationToken = default)
    {
        var query = await BuildCampaignQueryAsync(request, cancellationToken);
        var projected = query.Select(x => new ViewCampaignResponse
        {
            Id = x.Id,
            Title = x.Title,
            CampaignType = x.CampaignType,
            TemplateId = x.TemplateId,
            TemplateName = x.EmailTemplate.Name,
            ScheduleDate = x.ScheduleDate,
            Message = x.Message,
            RecipientCount = x.CampaignUsers.Count,
            CreatedOn = x.CreatedOn,
        });

        return await projected.PaginatedListAsync<ViewCampaignResponse, ViewCampaignResponse>(request.PageNumber, request.PageSize);
    }

    public async Task<ViewCampaignDetailResponse> GetByIdAsync(DefaultIdType id, CancellationToken cancellationToken = default)
    {
        var campaign = await _db.Campaigns
            .AsNoTracking()
            .Include(x => x.EmailTemplate)
            .Include(x => x.CampaignUsers)
            .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

        _ = campaign ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Campaign"));
        await EnsureCanReadCampaignAsync(campaign.CreatedBy, cancellationToken);

        return new ViewCampaignDetailResponse
        {
            Id = campaign.Id,
            Title = campaign.Title,
            CampaignType = campaign.CampaignType,
            TemplateId = campaign.TemplateId,
            TemplateName = campaign.EmailTemplate.Name,
            ScheduleDate = campaign.ScheduleDate,
            Message = campaign.Message,
            CreatedOn = campaign.CreatedOn,
            CampaignUsers = campaign.CampaignUsers
                .Select(x => new ViewCampaignUserResponse
                {
                    Id = x.Id,
                    UserId = x.UserId,
                    Contact = x.Contact,
                })
                .ToList(),
        };
    }

    public async Task<List<ViewCampaignLeadPickerResponse>> GetLeadsByOfferingAsync(DefaultIdType offeringId, CancellationToken cancellationToken = default)
    {
        await EnsureActiveOfferingIdAsync(offeringId, cancellationToken);

        var query = _db.Leads
            .AsNoTracking()
            .Where(x => x.FKOfferingId == offeringId && !x.IsArchived);

        query = await ApplyLeadScopeForCurrentUserAsync(query, cancellationToken);

        var leads = await query
            .OrderBy(x => x.BusinessName)
            .Select(x => new
            {
                x.Id,
                x.BusinessName,
                x.FKAssignedToUserId,
            })
            .ToListAsync(cancellationToken);

        var assignedById = await GetAssignedUsersByIdAsync(leads.Select(x => x.FKAssignedToUserId));

        return leads.Select(lead =>
        {
            var assignedUser = GetAssignedUser(assignedById, lead.FKAssignedToUserId);
            return new ViewCampaignLeadPickerResponse
            {
                Id = lead.Id,
                BusinessName = lead.BusinessName,
                OwnerName = GetAssignedUserDisplayName(assignedUser),
                Email = string.IsNullOrWhiteSpace(assignedUser?.Email) ? null : assignedUser.Email,
                Mobile = assignedUser?.PhoneNumber ?? string.Empty,
            };
        }).ToList();
    }

    public async Task<CreateCampaignResponse> CreateAsync(CreateCampaignRequest request, CancellationToken cancellationToken = default)
    {
        if (request.CampaignType != CampaignType.Email)
        {
            throw new BadRequestException(ErrorMessages.CampaignTypeNotSupported);
        }

        var leadIds = request.LeadIds.Distinct().ToList();
        if (leadIds.Count == 0)
        {
            throw new BadRequestException(ErrorMessages.CampaignLeadRequired);
        }

        await EnsureActiveOfferingIdAsync(request.OfferingId, cancellationToken);
        await EnsureTemplateExistsAsync(request.TemplateId, cancellationToken);

        var query = _db.Leads
            .Where(x => leadIds.Contains(x.Id)
                && x.FKOfferingId == request.OfferingId
                && !x.IsArchived);

        query = await ApplyLeadScopeForCurrentUserAsync(query, cancellationToken);

        var leads = await query.ToListAsync(cancellationToken);
        if (leads.Count != leadIds.Count)
        {
            throw new BadRequestException(ErrorMessages.CampaignLeadsInvalid);
        }

        var assignedById = await GetAssignedUsersByIdAsync(leads.Select(x => x.FKAssignedToUserId));

        var missingEmailNames = leads
            .Where(x => string.IsNullOrWhiteSpace(GetAssignedUserEmail(assignedById, x.FKAssignedToUserId)))
            .Select(x => x.BusinessName)
            .ToList();

        if (missingEmailNames.Count > 0)
        {
            throw new BadRequestException(string.Format(ErrorMessages.CampaignLeadEmailRequired, string.Join(", ", missingEmailNames)));
        }

        var campaign = new Campaigns
        {
            Title = request.Title.Trim(),
            CampaignType = request.CampaignType,
            TemplateId = request.TemplateId,
            ScheduleDate = request.ScheduleDate,
            Message = string.IsNullOrWhiteSpace(request.Message) ? null : request.Message.Trim(),
        };

        foreach (var lead in leads)
        {
            campaign.CampaignUsers.Add(new CampaignUsers
            {
                UserId = lead.Id,
                Contact = GetAssignedUserEmail(assignedById, lead.FKAssignedToUserId)!,
            });
        }

        await _db.Campaigns.AddAsync(campaign, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        ScheduleCampaignEmail(campaign.Id, campaign.ScheduleDate);

        return new CreateCampaignResponse
        {
            Id = campaign.Id,
            Message = SuccessMessages.CommonRecordCreated,
        };
    }

    public async Task<string> UpdateAsync(DefaultIdType id, UpdateCampaignRequest request, CancellationToken cancellationToken = default)
    {
        if (request.CampaignType != CampaignType.Email)
        {
            throw new BadRequestException(ErrorMessages.CampaignTypeNotSupported);
        }

        var campaign = await _db.Campaigns.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        _ = campaign ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Campaign"));
        await EnsureCanWriteCampaignAsync(campaign.CreatedBy, cancellationToken);
        await EnsureTemplateExistsAsync(request.TemplateId, cancellationToken);

        campaign.Title = request.Title.Trim();
        campaign.CampaignType = request.CampaignType;
        campaign.TemplateId = request.TemplateId;
        campaign.ScheduleDate = request.ScheduleDate;
        campaign.Message = string.IsNullOrWhiteSpace(request.Message) ? null : request.Message.Trim();

        await _db.SaveChangesAsync(cancellationToken);

        ScheduleCampaignEmail(campaign.Id, campaign.ScheduleDate);

        return SuccessMessages.CommonRecordUpdated;
    }

    private void ScheduleCampaignEmail(DefaultIdType campaignId, DateTimeOffset scheduleDate)
    {
        if (scheduleDate <= DateTimeOffset.UtcNow)
        {
            _jobService.Enqueue(() => _mailService.SendCampaignEmail(campaignId));
            return;
        }

        _jobService.Schedule(() => _mailService.SendCampaignEmail(campaignId), scheduleDate);
    }

    private async Task<IQueryable<Campaigns>> BuildCampaignQueryAsync(SearchCampaignRequest request, CancellationToken cancellationToken)
    {
        var query = _db.Campaigns.AsNoTracking().AsQueryable();

        if (request.CampaignType.HasValue)
        {
            query = query.Where(x => x.CampaignType == request.CampaignType.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            var term = request.SearchText.Trim().ToLower();
            query = query.Where(x =>
                x.Title.ToLower().Contains(term)
                || x.EmailTemplate.Name.ToLower().Contains(term)
                || x.Id.ToString().Contains(term));
        }

        query = await ApplyCampaignScopeForCurrentUserAsync(query, cancellationToken);

        return query.OrderByDescending(x => x.ScheduleDate).ThenByDescending(x => x.CreatedOn);
    }

    private async Task<IQueryable<Campaigns>> ApplyCampaignScopeForCurrentUserAsync(IQueryable<Campaigns> query, CancellationToken cancellationToken)
    {
        if (await _reportingHierarchyService.IsTenantAdminAsync(cancellationToken))
        {
            return query;
        }

        var accessibleUserIds = await _reportingHierarchyService.GetAccessibleUserIdsAsync(cancellationToken);
        var accessibleGuids = accessibleUserIds
            .Select(x => Guid.TryParse(x, out var id) ? id : (Guid?)null)
            .Where(x => x.HasValue)
            .Select(x => x!.Value)
            .ToList();

        return query.Where(x => accessibleGuids.Contains(x.CreatedBy));
    }

    private async Task<IQueryable<Leads>> ApplyLeadScopeForCurrentUserAsync(IQueryable<Leads> query, CancellationToken cancellationToken)
    {
        if (await _reportingHierarchyService.IsTenantAdminAsync(cancellationToken))
        {
            return query;
        }

        var accessibleUserIds = await _reportingHierarchyService.GetAccessibleUserIdsAsync(cancellationToken);
        return query.Where(x => x.FKAssignedToUserId == null || accessibleUserIds.Contains(x.FKAssignedToUserId));
    }

    private async Task EnsureCanReadCampaignAsync(Guid createdBy, CancellationToken cancellationToken)
    {
        if (createdBy == _currentUser.GetUserId())
        {
            return;
        }

        if (!await _reportingHierarchyService.CanReadAsync(createdBy.ToString(), cancellationToken))
        {
            throw new ForbiddenException(ErrorMessages.NotAuthorized);
        }
    }

    private async Task EnsureCanWriteCampaignAsync(Guid createdBy, CancellationToken cancellationToken)
    {
        if (createdBy == _currentUser.GetUserId())
        {
            return;
        }

        if (!await _reportingHierarchyService.CanWriteAsync(createdBy.ToString(), cancellationToken))
        {
            throw new ForbiddenException(ErrorMessages.NotAuthorized);
        }
    }

    private async Task EnsureActiveOfferingIdAsync(DefaultIdType offeringId, CancellationToken cancellationToken)
    {
        var isValid = await _db.Offerings
            .AsNoTracking()
            .AnyAsync(x => x.Id == offeringId && x.Status == OfferingStatus.Active, cancellationToken);

        if (!isValid)
        {
            throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Offering"));
        }
    }

    private async Task EnsureTemplateExistsAsync(DefaultIdType templateId, CancellationToken cancellationToken)
    {
        var exists = await _db.EmailTemplates
            .AsNoTracking()
            .AnyAsync(x => x.Id == templateId, cancellationToken);

        if (!exists)
        {
            throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Email Template"));
        }
    }

    private async Task<Dictionary<string, ViewUserDetailsResponse>> GetAssignedUsersByIdAsync(IEnumerable<string?> assignedUserIds)
    {
        var userIds = assignedUserIds
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (userIds.Length == 0)
        {
            return new Dictionary<string, ViewUserDetailsResponse>(StringComparer.OrdinalIgnoreCase);
        }

        var users = await _userService.GetUserDetails(userIds);
        return users.ToDictionary(x => x.Id.ToString(), StringComparer.OrdinalIgnoreCase);
    }

    private static ViewUserDetailsResponse? GetAssignedUser(
        IReadOnlyDictionary<string, ViewUserDetailsResponse> assignedById,
        string? assignedToUserId)
    {
        if (string.IsNullOrWhiteSpace(assignedToUserId))
        {
            return null;
        }

        return assignedById.TryGetValue(assignedToUserId, out var user) ? user : null;
    }

    private static string GetAssignedUserDisplayName(ViewUserDetailsResponse? user) =>
        user is null ? string.Empty : $"{user.FirstName} {user.LastName}".Trim();

    private static string? GetAssignedUserEmail(
        IReadOnlyDictionary<string, ViewUserDetailsResponse> assignedById,
        string? assignedToUserId)
    {
        var email = GetAssignedUser(assignedById, assignedToUserId)?.Email;
        return string.IsNullOrWhiteSpace(email) ? null : email;
    }
}
