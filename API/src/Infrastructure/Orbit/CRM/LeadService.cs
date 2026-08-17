using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Application.Common.Models;
using FlowPilot.Application.Common.Notes.Model.Request;
using FlowPilot.Application.Common.Notes.Model.Response;
using FlowPilot.Application.CRM;
using FlowPilot.Application.CRM.Model.Request.Lead;
using FlowPilot.Application.CRM.Model.Request.LeadActivity;
using FlowPilot.Application.CRM.Model.Response.Lead;
using FlowPilot.Application.CRM.Model.Response.LeadActivity;
using FlowPilot.Application.Nexus.Identity.Users;
using FlowPilot.Domain.Common;
using FlowPilot.Domain.CRM;
using FlowPilot.Domain.Enums;
using FlowPilot.Domain.Enums.Common;
using FlowPilot.Domain.Enums.CRM;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Infrastructure.SystemConstants;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Orbit.CRM;

public class LeadService : ILeadService
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;
    private readonly IDateTimeService _dateTimeService;
    private readonly IReportingHierarchyService _reportingHierarchyService;

    public LeadService(
        ApplicationDbContext db,
        ICurrentUser currentUser,
        IDateTimeService dateTimeService,
        IReportingHierarchyService reportingHierarchyService)
    {
        _db = db;
        _currentUser = currentUser;
        _dateTimeService = dateTimeService;
        _reportingHierarchyService = reportingHierarchyService;
    }

    public async Task<PaginationResponse<ViewLeadListResponse>> SearchAsync(SearchLeadRequest request, CancellationToken cancellationToken = default)
    {
        var query = await BuildLeadQueryAsync(request, cancellationToken);
        var projected = query.Select(x => new ViewLeadListResponse
        {
            Id = x.Id,
            BusinessName = x.BusinessName,
            OwnerName = x.LeadContacts.Where(c => c.IsPrimary).Select(c => c.OwnerName).FirstOrDefault() ?? string.Empty,
            Mobile = x.LeadContacts.Where(c => c.IsPrimary).Select(c => c.Mobile).FirstOrDefault() ?? string.Empty,
            BusinessType = x.BusinessType,
            CurrentPOS = x.CurrentPOS,
            OfferingId = x.FKOfferingId,
            OfferingName = x.Offering != null ? x.Offering.Name : "Unassigned",
            AssignedToUserId = x.FKAssignedToUserId,
            LeadStatusId = x.FKLeadStatusId,
            LeadStatusName = x.LeadStatus.LookUpValue,
            NextFollowUpDate = x.NextFollowUpDate,
            LastActivityDate = x.LastActivityDate,
            ExpectedRevenue = x.ExpectedRevenue,
            CreatedOn = x.CreatedOn,
            InterestLevel = x.InterestLevel,
            IsArchived = x.IsArchived,
        });

        return await projected.PaginatedListAsync<ViewLeadListResponse, ViewLeadListResponse>(request.PageNumber, request.PageSize);
    }

    public async Task<ViewLeadDetailResponse> GetByIdAsync(DefaultIdType id, CancellationToken cancellationToken = default)
    {
        var lead = await _db.Leads
            .AsNoTracking()
            .Include(x => x.LeadContacts)
            .Include(x => x.LeadActivities)
            .Include(x => x.LeadFollowUps)
            .Include(x => x.Offering)
            .Include(x => x.LeadStatus)
            .Include(x => x.LeadSource)
            .Include(x => x.LeadStatusHistories).ThenInclude(x => x.FromStatus)
            .Include(x => x.LeadStatusHistories).ThenInclude(x => x.ToStatus)
            .Include(x => x.LeadAssignmentHistories)
            .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

        _ = lead ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Lead"));

        await EnsureCanReadLeadAsync(lead.FKAssignedToUserId, cancellationToken);

        var contact = lead.LeadContacts.FirstOrDefault(c => c.IsPrimary);
        var notes = await _db.EntityNotes
            .AsNoTracking()
            .Where(n => n.FKEntityPKId == id && (n.EntityNoteType == EntityNoteType.Lead || n.EntityNoteType == EntityNoteType.LeadSummary))
            .OrderByDescending(n => n.CreatedOn)
            .ToListAsync(cancellationToken);

        return MapToDetail(lead, contact, notes);
    }

    public async Task<CreateLeadResponse> CreateAsync(CreateLeadRequest request, CancellationToken cancellationToken = default)
    {
        var assignedToUserId = ResolveAssignedToUserId(request.AssignToYourself, request.AssignedToUserId);

        await ValidateDuplicatesAsync(request.Mobile, request.Email, request.GstNumber, null, cancellationToken);
        await EnsureCanWriteLeadAsync(assignedToUserId, cancellationToken);

        var leadStatusId = request.LeadStatusId ?? await GetDefaultLeadStatusIdAsync(cancellationToken);
        await EnsureActiveOfferingIdAsync(request.OfferingId, cancellationToken);
        await EnsureValidLeadStatusIdAsync(leadStatusId, cancellationToken);
        await EnsureValidLeadSourceIdAsync(request.LeadSourceId, cancellationToken);

        var lead = new Leads
        {
            BusinessName = request.BusinessName,
            BusinessType = request.BusinessType,
            CurrentPOS = request.CurrentPOS,
            Website = request.Website,
            GstNumber = request.GstNumber,
            Pan = request.Pan,
            NumberOfOutlets = request.NumberOfOutlets,
            ExpectedMonthlyBilling = request.ExpectedMonthlyBilling,
            ExpectedRevenue = request.ExpectedRevenue,
            CompanySize = request.CompanySize,
            FKOfferingId = request.OfferingId,
            FKLeadSourceId = request.LeadSourceId,
            FKAssignedToUserId = assignedToUserId,
            Priority = request.Priority,
            FKLeadStatusId = leadStatusId,
            ExpectedClosingDate = request.ExpectedClosingDate,
            InterestLevel = request.InterestLevel,
            Country = request.Country,
            State = request.State,
            City = request.City,
            Area = request.Area,
            Pincode = request.Pincode,
            FullAddress = request.FullAddress,
            GoogleMapsLink = request.GoogleMapsLink,
            PlaceId = request.PlaceId,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            PainPoints = request.PainPoints,
            Competitors = request.Competitors,
            Requirements = request.Requirements,
            Metadata = request.Metadata,
            LeadContacts =
            [
                new LeadContacts
                {
                    OwnerName = request.OwnerName,
                    Designation = request.Designation,
                    Mobile = request.Mobile,
                    WhatsApp = request.WhatsApp,
                    Email = request.Email,
                    AlternatePhone = request.AlternatePhone,
                    IsPrimary = true,
                }
            ],
            LeadStatusHistories =
            [
                new LeadStatusHistories
                {
                    FKFromStatusId = null,
                    FKToStatusId = leadStatusId,
                    ChangedByUserId = _currentUser.GetUserId().ToString(),
                    ChangedOn = _dateTimeService.UtcNow,
                }
            ],
        };

        if (!string.IsNullOrWhiteSpace(assignedToUserId))
        {
            lead.LeadAssignmentHistories =
            [
                new LeadAssignmentHistories
                {
                    FromUserId = null,
                    ToUserId = assignedToUserId,
                    AssignedByUserId = _currentUser.GetUserId().ToString(),
                    AssignedOn = _dateTimeService.UtcNow,
                }
            ];
        }

        await _db.Leads.AddAsync(lead, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(request.Notes))
        {
            await _db.EntityNotes.AddAsync(new EntityNotes
            {
                EntityNoteType = EntityNoteType.LeadSummary,
                FKEntityPKId = lead.Id,
                NoteText = request.Notes,
            }, cancellationToken);
            await _db.SaveChangesAsync(cancellationToken);
        }

        return new CreateLeadResponse
        {
            Id = lead.Id,
            Message = SuccessMessages.CommonRecordCreated,
        };
    }

    public async Task<string> UpdateAsync(DefaultIdType id, UpdateLeadRequest request, CancellationToken cancellationToken = default)
    {
        var lead = await _db.Leads
            .Include(x => x.LeadContacts)
            .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

        _ = lead ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Lead"));

        await EnsureCanWriteLeadAsync(lead.FKAssignedToUserId, cancellationToken);

        var assignedToUserId = ResolveAssignedToUserId(request.AssignToYourself, request.AssignedToUserId);

        await ValidateDuplicatesAsync(request.Mobile, request.Email, request.GstNumber, id, cancellationToken);

        await EnsureActiveOfferingIdAsync(request.OfferingId, cancellationToken);
        await EnsureValidLeadStatusIdAsync(request.LeadStatusId, cancellationToken);
        await EnsureValidLeadSourceIdAsync(request.LeadSourceId, cancellationToken);
        await EnsureCanWriteLeadAsync(assignedToUserId, cancellationToken);

        var fromUserId = lead.FKAssignedToUserId;
        var assigneeChanged = !string.Equals(fromUserId, assignedToUserId, StringComparison.OrdinalIgnoreCase);
        var coordsChanged = lead.Latitude != request.Latitude || lead.Longitude != request.Longitude;

        lead.BusinessName = request.BusinessName;
        lead.BusinessType = request.BusinessType;
        lead.CurrentPOS = request.CurrentPOS;
        lead.Website = request.Website;
        lead.GstNumber = request.GstNumber;
        lead.Pan = request.Pan;
        lead.NumberOfOutlets = request.NumberOfOutlets;
        lead.ExpectedMonthlyBilling = request.ExpectedMonthlyBilling;
        lead.ExpectedRevenue = request.ExpectedRevenue;
        lead.CompanySize = request.CompanySize;
        lead.FKOfferingId = request.OfferingId;
        lead.FKLeadSourceId = request.LeadSourceId;
        lead.FKAssignedToUserId = assignedToUserId;
        lead.Priority = request.Priority;
        lead.FKLeadStatusId = request.LeadStatusId;
        lead.ExpectedClosingDate = request.ExpectedClosingDate;
        lead.InterestLevel = request.InterestLevel;
        lead.Country = request.Country;
        lead.State = request.State;
        lead.City = request.City;
        lead.Area = request.Area;
        lead.Pincode = request.Pincode;
        lead.FullAddress = request.FullAddress;
        lead.GoogleMapsLink = request.GoogleMapsLink;
        lead.PlaceId = request.PlaceId;
        lead.Latitude = request.Latitude;
        lead.Longitude = request.Longitude;
        lead.PainPoints = request.PainPoints;
        lead.Competitors = request.Competitors;
        lead.Requirements = request.Requirements;
        lead.Metadata = request.Metadata;
        lead.IsArchived = request.IsArchived;

        var contact = lead.LeadContacts.FirstOrDefault(c => c.IsPrimary);
        if (contact is null)
        {
            contact = new LeadContacts
            {
                FKLeadPKId = lead.Id,
                OwnerName = request.OwnerName,
                Mobile = request.Mobile,
                IsPrimary = true,
            };
            lead.LeadContacts.Add(contact);
        }
        else
        {
            contact.OwnerName = request.OwnerName;
            contact.Designation = request.Designation;
            contact.Mobile = request.Mobile;
            contact.WhatsApp = request.WhatsApp;
            contact.Email = request.Email;
            contact.AlternatePhone = request.AlternatePhone;
        }

        if (assigneeChanged)
        {
            await _db.LeadAssignmentHistories.AddAsync(new LeadAssignmentHistories
            {
                FKLeadPKId = lead.Id,
                FromUserId = fromUserId,
                ToUserId = assignedToUserId,
                AssignedByUserId = _currentUser.GetUserId().ToString(),
                AssignedOn = _dateTimeService.UtcNow,
            }, cancellationToken);
        }

        if (coordsChanged)
        {
            await ReverifyGpsLogsForLeadAsync(id, request.Latitude, request.Longitude, cancellationToken);
        }

        await _db.SaveChangesAsync(cancellationToken);
        return SuccessMessages.CommonRecordUpdated;
    }

    public async Task<string> UpdateStatusAsync(DefaultIdType id, UpdateLeadStatusRequest request, CancellationToken cancellationToken = default)
    {
        var lead = await _db.Leads
            .Include(x => x.LeadStatus)
            .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        _ = lead ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Lead"));

        await EnsureCanWriteLeadAsync(lead.FKAssignedToUserId, cancellationToken);
        await EnsureValidLeadStatusIdAsync(request.LeadStatusId, cancellationToken);

        var newStatus = await _db.LookUpCodeValues
            .AsNoTracking()
            .SingleAsync(x => x.Id == request.LeadStatusId, cancellationToken);

        var fromStatusId = lead.FKLeadStatusId;
        lead.FKLeadStatusId = request.LeadStatusId;

        if (string.Equals(newStatus.LookUpValue, "Won", StringComparison.OrdinalIgnoreCase))
        {
            lead.ConvertedOn = _dateTimeService.UtcNow;
        }

        await _db.LeadStatusHistories.AddAsync(new LeadStatusHistories
        {
            FKLeadPKId = lead.Id,
            FKFromStatusId = fromStatusId,
            FKToStatusId = request.LeadStatusId,
            ChangedByUserId = _currentUser.GetUserId().ToString(),
            ChangedOn = _dateTimeService.UtcNow,
            Remarks = request.Remarks,
        }, cancellationToken);

        await _db.SaveChangesAsync(cancellationToken);
        return SuccessMessages.CommonRecordUpdated;
    }

    public async Task<string> AssignAsync(DefaultIdType id, AssignLeadRequest request, CancellationToken cancellationToken = default)
    {
        var lead = await _db.Leads.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        _ = lead ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Lead"));

        var assignedToUserId = ResolveAssignedToUserId(request.AssignToYourself, request.AssignedToUserId);

        await EnsureCanWriteLeadAsync(lead.FKAssignedToUserId, cancellationToken);
        await EnsureCanWriteLeadAsync(assignedToUserId, cancellationToken);

        var fromUserId = lead.FKAssignedToUserId;
        if (string.Equals(fromUserId, assignedToUserId, StringComparison.OrdinalIgnoreCase))
        {
            return SuccessMessages.CommonRecordUpdated;
        }

        lead.FKAssignedToUserId = assignedToUserId;

        await _db.LeadAssignmentHistories.AddAsync(new LeadAssignmentHistories
        {
            FKLeadPKId = lead.Id,
            FromUserId = fromUserId,
            ToUserId = assignedToUserId,
            AssignedByUserId = _currentUser.GetUserId().ToString(),
            AssignedOn = _dateTimeService.UtcNow,
            Remarks = request.Remarks,
        }, cancellationToken);

        await _db.SaveChangesAsync(cancellationToken);
        return SuccessMessages.CommonRecordUpdated;
    }

    public async Task<string> UpdateFollowUpDateAsync(DefaultIdType id, UpdateLeadFollowUpDateRequest request, CancellationToken cancellationToken = default)
    {
        var lead = await _db.Leads
            .Include(x => x.LeadFollowUps)
            .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

        _ = lead ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Lead"));

        await EnsureCanWriteLeadAsync(lead.FKAssignedToUserId, cancellationToken);
        lead.NextFollowUpDate = request.NextFollowUpDate;

        var pendingFollowUp = lead.LeadFollowUps
            .Where(x => x.FollowUpStatus == FollowUpStatus.Pending)
            .OrderByDescending(x => x.NextFollowUpDate)
            .FirstOrDefault();

        _ = pendingFollowUp ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Lead FollowUp"));
        pendingFollowUp.NextFollowUpDate = request.NextFollowUpDate;

        await _db.SaveChangesAsync(cancellationToken);
        return SuccessMessages.CommonRecordUpdated;
    }

    public async Task<List<ViewLeadListResponse>> GetTodayFollowUpsAsync(CancellationToken cancellationToken = default)
    {
        var today = _dateTimeService.UtcNow.Date;
        var start = new DateTimeOffset(today, TimeSpan.Zero);
        var tomorrow = start.AddDays(1);
        var query = _db.Leads.AsNoTracking().Where(x => x.NextFollowUpDate >= start && x.NextFollowUpDate < tomorrow && !x.IsArchived);
        query = await ApplyLeadScopeForCurrentUserAsync(query, cancellationToken);

        return await query
            .Select(x => new ViewLeadListResponse
            {
                Id = x.Id,
                BusinessName = x.BusinessName,
                OwnerName = x.LeadContacts.Where(c => c.IsPrimary).Select(c => c.OwnerName).FirstOrDefault() ?? string.Empty,
                Mobile = x.LeadContacts.Where(c => c.IsPrimary).Select(c => c.Mobile).FirstOrDefault() ?? string.Empty,
                BusinessType = x.BusinessType,
                CurrentPOS = x.CurrentPOS,
                OfferingId = x.FKOfferingId,
                OfferingName = x.Offering != null ? x.Offering.Name : "Unassigned",
                AssignedToUserId = x.FKAssignedToUserId,
                LeadStatusId = x.FKLeadStatusId,
                LeadStatusName = x.LeadStatus.LookUpValue,
                NextFollowUpDate = x.NextFollowUpDate,
                LastActivityDate = x.LastActivityDate,
                ExpectedRevenue = x.ExpectedRevenue,
                CreatedOn = x.CreatedOn,
                InterestLevel = x.InterestLevel,
                IsArchived = x.IsArchived,
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ViewLeadListResponse>> GetOverdueFollowUpsAsync(CancellationToken cancellationToken = default)
    {
        var today = _dateTimeService.UtcNow.Date;
        var closedStatusIds = await GetClosedLeadStatusIdsAsync(cancellationToken);
        var query = _db.Leads.AsNoTracking().Where(x => x.NextFollowUpDate < today
            && !closedStatusIds.Contains(x.FKLeadStatusId)
            && !x.IsArchived);
        query = await ApplyLeadScopeForCurrentUserAsync(query, cancellationToken);

        return await query
            .Select(x => new ViewLeadListResponse
            {
                Id = x.Id,
                BusinessName = x.BusinessName,
                OwnerName = x.LeadContacts.Where(c => c.IsPrimary).Select(c => c.OwnerName).FirstOrDefault() ?? string.Empty,
                Mobile = x.LeadContacts.Where(c => c.IsPrimary).Select(c => c.Mobile).FirstOrDefault() ?? string.Empty,
                BusinessType = x.BusinessType,
                CurrentPOS = x.CurrentPOS,
                OfferingId = x.FKOfferingId,
                OfferingName = x.Offering != null ? x.Offering.Name : "Unassigned",
                AssignedToUserId = x.FKAssignedToUserId,
                LeadStatusId = x.FKLeadStatusId,
                LeadStatusName = x.LeadStatus.LookUpValue,
                NextFollowUpDate = x.NextFollowUpDate,
                LastActivityDate = x.LastActivityDate,
                ExpectedRevenue = x.ExpectedRevenue,
                CreatedOn = x.CreatedOn,
                InterestLevel = x.InterestLevel,
                IsArchived = x.IsArchived,
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ViewLeadActivityResponse>> GetActivitiesAsync(DefaultIdType leadId, CancellationToken cancellationToken = default)
    {
        await EnsureLeadAccessibleAsync(leadId, cancellationToken);

        return await _db.LeadActivities
            .AsNoTracking()
            .Where(x => x.FKLeadPKId == leadId)
            .OrderByDescending(x => x.ActivityDate)
            .ThenByDescending(x => x.CreatedOn)
            .ProjectToType<ViewLeadActivityResponse>()
            .ToListAsync(cancellationToken);
    }

    public async Task<ViewLeadActivityResponse> CreateActivityAsync(DefaultIdType leadId, CreateLeadActivityRequest request, CancellationToken cancellationToken = default)
    {
        var lead = await _db.Leads.SingleOrDefaultAsync(x => x.Id == leadId, cancellationToken);
        _ = lead ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Lead"));

        await EnsureCanWriteLeadAsync(lead.FKAssignedToUserId, cancellationToken);

        var activity = new LeadActivities
        {
            FKLeadPKId = leadId,
            ActivityType = request.ActivityType,
            ActivityDate = request.ActivityDate,
            ActivityTime = request.ActivityTime,
            DurationMinutes = request.DurationMinutes,
            Outcome = request.Outcome,
            Notes = request.Notes,
            NextFollowUpDate = request.NextFollowUpDate,
        };

        lead.LastActivityDate = request.ActivityDate;

        if (request.NextFollowUpDate.HasValue)
        {
            lead.NextFollowUpDate = request.NextFollowUpDate;
            await _db.LeadFollowUps.AddAsync(new LeadFollowUps
            {
                FKLeadPKId = leadId,
                NextFollowUpDate = request.NextFollowUpDate.Value,
                FollowUpType = request.FollowUpType ?? FollowUpType.Other,
                FollowUpStatus = FollowUpStatus.Pending,
                ReminderNote = request.ReminderNote,
            }, cancellationToken);
        }

        await _db.LeadActivities.AddAsync(activity, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        return activity.Adapt<ViewLeadActivityResponse>();
    }

    public async Task<List<ViewEntityNoteResponse>> GetNotesAsync(DefaultIdType leadId, CancellationToken cancellationToken = default)
    {
        await EnsureLeadAccessibleAsync(leadId, cancellationToken);

        return await _db.EntityNotes
            .AsNoTracking()
            .Where(n => n.FKEntityPKId == leadId && (n.EntityNoteType == EntityNoteType.Lead || n.EntityNoteType == EntityNoteType.LeadSummary))
            .OrderByDescending(n => n.CreatedOn)
            .ProjectToType<ViewEntityNoteResponse>()
            .ToListAsync(cancellationToken);
    }

    public async Task<ViewEntityNoteResponse> CreateNoteAsync(DefaultIdType leadId, CreateEntityNoteRequest request, CancellationToken cancellationToken = default)
    {
        await EnsureLeadWritableAsync(leadId, cancellationToken);

        var note = new EntityNotes
        {
            EntityNoteType = request.EntityNoteType,
            FKEntityPKId = leadId,
            NoteText = request.NoteText,
        };

        await _db.EntityNotes.AddAsync(note, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        return note.Adapt<ViewEntityNoteResponse>();
    }

    private async Task<IQueryable<Leads>> BuildLeadQueryAsync(SearchLeadRequest request, CancellationToken cancellationToken)
    {
        var query = _db.Leads.AsNoTracking().AsQueryable();
        var userId = _currentUser.GetUserId().ToString();
        var today = _dateTimeService.UtcNow.Date;

        var start = new DateTimeOffset(today, TimeSpan.Zero);
        var end = start.AddDays(1);
        var closedStatusIds = await GetClosedLeadStatusIdsAsync(cancellationToken);
        var wonStatusIds = await GetLeadStatusIdsByValueAsync("Won", cancellationToken);
        var lostStatusIds = await GetLeadStatusIdsByValueAsync("Lost", cancellationToken);

        switch (request.FilterType)
        {
            case LeadFilterType.MyLeads:
                query = query.Where(x => x.FKAssignedToUserId == userId);
                break;
            case LeadFilterType.TodayFollowUps:
                query = query.Where(x => x.NextFollowUpDate >= start && x.NextFollowUpDate < end);
                break;
            case LeadFilterType.Overdue:
                query = query.Where(x => x.NextFollowUpDate < start
                    && !closedStatusIds.Contains(x.FKLeadStatusId));
                break;
            case LeadFilterType.Interested:
                query = query.Where(x => x.InterestLevel == InterestLevel.High);
                break;
            case LeadFilterType.Won:
                query = query.Where(x => wonStatusIds.Contains(x.FKLeadStatusId));
                break;
            case LeadFilterType.Lost:
                query = query.Where(x => lostStatusIds.Contains(x.FKLeadStatusId));
                break;
            case LeadFilterType.Archived:
                query = query.Where(x => x.IsArchived);
                break;
            default:
                query = query.Where(x => !x.IsArchived);
                break;
        }

        if (!string.IsNullOrWhiteSpace(request.AssignedToUserId))
        {
            if (!await _reportingHierarchyService.CanReadAsync(request.AssignedToUserId, cancellationToken))
            {
                throw new ForbiddenException(ErrorMessages.NotAuthorized);
            }

            query = query.Where(x => x.FKAssignedToUserId == request.AssignedToUserId);
        }
        else
        {
            query = await ApplyLeadScopeForCurrentUserAsync(query, cancellationToken);
        }

        if (request.OfferingUniqueId.HasValue)
        {
            query = query.Where(x => x.Offering != null && x.Offering.UniqueId == request.OfferingUniqueId.Value);
        }
        else if (request.OfferingId.HasValue)
        {
            query = query.Where(x => x.FKOfferingId == request.OfferingId.Value);
        }

        if (request.FromDate.HasValue)
        {
            query = query.Where(x => x.CreatedOn >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(x => x.CreatedOn <= request.ToDate.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.SearchText))
        {
            var term = request.SearchText.Trim().ToLower();
            query = query.Where(x =>
                x.BusinessName.ToLower().Contains(term)
                || x.LeadContacts.Any(c => c.IsPrimary && c.OwnerName.ToLower().Contains(term))
                || x.LeadContacts.Any(c => c.IsPrimary && c.Mobile.Contains(term))
                || (x.LeadContacts.Any(c => c.IsPrimary && c.Email != null && c.Email.ToLower().Contains(term)))
                || (x.GstNumber != null && x.GstNumber.ToLower().Contains(term))
                || x.Id.ToString().Contains(term));
        }

        return query.OrderByDescending(x => x.CreatedOn);
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

    private async Task EnsureCanReadLeadAsync(string? assignedToUserId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(assignedToUserId))
        {
            return;
        }

        if (!await _reportingHierarchyService.CanReadAsync(assignedToUserId, cancellationToken))
        {
            throw new ForbiddenException(ErrorMessages.NotAuthorized);
        }
    }

    private string? ResolveAssignedToUserId(bool assignToYourself, string? assignedToUserId)
    {
        return assignToYourself
            ? _currentUser.GetUserId().ToString()
            : string.IsNullOrWhiteSpace(assignedToUserId) ? null : assignedToUserId.Trim();
    }

    private async Task EnsureCanWriteLeadAsync(string? assignedToUserId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(assignedToUserId))
        {
            return;
        }

        if (!await _reportingHierarchyService.CanWriteAsync(assignedToUserId, cancellationToken))
        {
            throw new ForbiddenException(ErrorMessages.NotAuthorized);
        }
    }

    private async Task EnsureLeadAccessibleAsync(DefaultIdType leadId, CancellationToken cancellationToken)
    {
        var lead = await _db.Leads
            .AsNoTracking()
            .Where(x => x.Id == leadId)
            .Select(x => new { x.FKAssignedToUserId })
            .FirstOrDefaultAsync(cancellationToken);

        if (lead is null)
        {
            throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Lead"));
        }

        await EnsureCanReadLeadAsync(lead.FKAssignedToUserId, cancellationToken);
    }

    private async Task EnsureLeadWritableAsync(DefaultIdType leadId, CancellationToken cancellationToken)
    {
        var lead = await _db.Leads
            .AsNoTracking()
            .Where(x => x.Id == leadId)
            .Select(x => new { x.FKAssignedToUserId })
            .FirstOrDefaultAsync(cancellationToken);

        if (lead is null)
        {
            throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Lead"));
        }

        await EnsureCanWriteLeadAsync(lead.FKAssignedToUserId, cancellationToken);
    }

    private async Task ValidateDuplicatesAsync(string mobile, string? email, string? gstNumber, DefaultIdType? excludeLeadId, CancellationToken cancellationToken)
    {
        var query = _db.Leads
            .Include(x => x.LeadContacts)
            .AsQueryable();

        if (excludeLeadId.HasValue)
        {
            query = query.Where(x => x.Id != excludeLeadId.Value);
        }

        var leads = await query.ToListAsync(cancellationToken);

        foreach (var lead in leads)
        {
            var contact = lead.LeadContacts.FirstOrDefault(c => c.IsPrimary);
            if (contact?.Mobile == mobile)
            {
                throw new ConflictException(string.Format(ErrorMessages.ItemAlreadyExists, mobile));
            }

            if (!string.IsNullOrWhiteSpace(email) && contact?.Email != null && contact.Email.Equals(email, StringComparison.OrdinalIgnoreCase))
            {
                throw new ConflictException(string.Format(ErrorMessages.ItemAlreadyExists, email));
            }

            if (!string.IsNullOrWhiteSpace(gstNumber) && lead.GstNumber != null && lead.GstNumber.Equals(gstNumber, StringComparison.OrdinalIgnoreCase))
            {
                throw new ConflictException(string.Format(ErrorMessages.ItemAlreadyExists, gstNumber));
            }
        }
    }

    private static ViewLeadDetailResponse MapToDetail(Leads lead, LeadContacts? contact, List<EntityNotes> notes)
    {
        return new ViewLeadDetailResponse
        {
            Id = lead.Id,
            BusinessName = lead.BusinessName,
            BusinessType = lead.BusinessType,
            CurrentPOS = lead.CurrentPOS,
            Website = lead.Website,
            GstNumber = lead.GstNumber,
            Pan = lead.Pan,
            NumberOfOutlets = lead.NumberOfOutlets,
            ExpectedMonthlyBilling = lead.ExpectedMonthlyBilling,
            ExpectedRevenue = lead.ExpectedRevenue,
            CompanySize = lead.CompanySize,
            OfferingId = lead.FKOfferingId,
            OfferingName = lead.Offering?.Name ?? "Unassigned",
            OwnerName = contact?.OwnerName ?? string.Empty,
            Designation = contact?.Designation,
            Mobile = contact?.Mobile ?? string.Empty,
            WhatsApp = contact?.WhatsApp,
            Email = contact?.Email,
            AlternatePhone = contact?.AlternatePhone,
            Country = lead.Country,
            State = lead.State,
            City = lead.City,
            Area = lead.Area,
            Pincode = lead.Pincode,
            FullAddress = lead.FullAddress,
            GoogleMapsLink = lead.GoogleMapsLink,
            PlaceId = lead.PlaceId,
            Latitude = lead.Latitude,
            Longitude = lead.Longitude,
            LeadSourceId = lead.FKLeadSourceId,
            LeadSourceName = lead.LeadSource.LookUpValue,
            AssignedToUserId = lead.FKAssignedToUserId,
            Priority = lead.Priority,
            LeadStatusId = lead.FKLeadStatusId,
            LeadStatusName = lead.LeadStatus.LookUpValue,
            ExpectedClosingDate = lead.ExpectedClosingDate,
            InterestLevel = lead.InterestLevel,
            PainPoints = lead.PainPoints,
            Competitors = lead.Competitors,
            Requirements = lead.Requirements,
            Metadata = lead.Metadata,
            LastActivityDate = lead.LastActivityDate,
            NextFollowUpDate = lead.NextFollowUpDate,
            IsArchived = lead.IsArchived,
            ConvertedOn = lead.ConvertedOn,
            FKConvertedCustomerId = lead.FKConvertedCustomerId,
            CreatedOn = lead.CreatedOn,
            Activities = lead.LeadActivities
                .OrderByDescending(a => a.ActivityDate)
                .Adapt<List<ViewLeadActivityResponse>>(),
            FollowUps = lead.LeadFollowUps
                .OrderByDescending(f => f.NextFollowUpDate)
                .Adapt<List<ViewLeadFollowUpResponse>>(),
            Notes = notes.Adapt<List<ViewEntityNoteResponse>>(),
            StatusHistories = lead.LeadStatusHistories
                .OrderByDescending(h => h.ChangedOn)
                .Select(h => new ViewLeadStatusHistoryResponse
                {
                    Id = h.Id,
                    FromStatusId = h.FKFromStatusId,
                    FromStatusName = h.FromStatus?.LookUpValue,
                    ToStatusId = h.FKToStatusId,
                    ToStatusName = h.ToStatus.LookUpValue,
                    ChangedByUserId = h.ChangedByUserId,
                    ChangedOn = h.ChangedOn,
                    Remarks = h.Remarks,
                })
                .ToList(),
            AssignmentHistories = lead.LeadAssignmentHistories
                .OrderByDescending(h => h.AssignedOn)
                .Adapt<List<ViewLeadAssignmentHistoryResponse>>(),
        };
    }

    private async Task ReverifyGpsLogsForLeadAsync(
        DefaultIdType leadId,
        decimal? referenceLatitude,
        decimal? referenceLongitude,
        CancellationToken cancellationToken)
    {
        var gpsLogs = await _db.GpsLogs
            .Include(g => g.Verification)
            .Where(g => g.Visit.FKLeadPKId == leadId)
            .ToListAsync(cancellationToken);

        foreach (var gpsLog in gpsLogs)
        {
            if (gpsLog.Verification is null)
            {
                gpsLog.Verification = new GpsVerifications();
            }

            GpsVerificationHelper.Apply(
                gpsLog.Verification,
                gpsLog.Latitude,
                gpsLog.Longitude,
                referenceLatitude,
                referenceLongitude);
        }
    }

    private async Task EnsureValidLeadStatusIdAsync(DefaultIdType leadStatusId, CancellationToken cancellationToken)
    {
        var isValid = await _db.LookUpCodeValues
            .AsNoTracking()
            .AnyAsync(x => x.Id == leadStatusId
                && x.IsActive
                && x.LookUpCode.LookUpCodeType == LookUpCodeTypes.LeadStatus, cancellationToken);

        if (!isValid)
        {
            throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Lead Status"));
        }
    }

    private async Task EnsureValidLeadSourceIdAsync(DefaultIdType leadSourceId, CancellationToken cancellationToken)
    {
        var isValid = await _db.LookUpCodeValues
            .AsNoTracking()
            .AnyAsync(x => x.Id == leadSourceId
                && x.IsActive
                && x.LookUpCode.LookUpCodeType == LookUpCodeTypes.LeadSource, cancellationToken);

        if (!isValid)
        {
            throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Lead Source"));
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

    private async Task<DefaultIdType> GetDefaultLeadStatusIdAsync(CancellationToken cancellationToken)
    {
        var defaultStatus = await _db.LookUpCodeValues
            .AsNoTracking()
            .Where(x => x.IsActive && x.LookUpCode.LookUpCodeType == LookUpCodeTypes.LeadStatus)
            .OrderBy(x => x.LookUpValue == "New" ? 0 : 1)
            .ThenBy(x => x.DisplayOrder)
            .Select(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (defaultStatus == default)
        {
            throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Lead Status"));
        }

        return defaultStatus;
    }

    private async Task<List<DefaultIdType>> GetLeadStatusIdsByValueAsync(string lookUpValue, CancellationToken cancellationToken) =>
        await _db.LookUpCodeValues
            .AsNoTracking()
            .Where(x => x.IsActive
                && x.LookUpCode.LookUpCodeType == LookUpCodeTypes.LeadStatus
                && x.LookUpValue == lookUpValue)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

    private async Task<List<DefaultIdType>> GetClosedLeadStatusIdsAsync(CancellationToken cancellationToken) =>
        await _db.LookUpCodeValues
            .AsNoTracking()
            .Where(x => x.IsActive
                && x.LookUpCode.LookUpCodeType == LookUpCodeTypes.LeadStatus
                && (x.LookUpValue == "Won" || x.LookUpValue == "Lost"))
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);
}
