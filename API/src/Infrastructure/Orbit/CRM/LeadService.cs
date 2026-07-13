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
using FlowPilot.Domain.Common;
using FlowPilot.Domain.CRM;
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

    public LeadService(
        ApplicationDbContext db,
        ICurrentUser currentUser,
        IDateTimeService dateTimeService)
    {
        _db = db;
        _currentUser = currentUser;
        _dateTimeService = dateTimeService;
    }

    public async Task<PaginationResponse<ViewLeadListResponse>> SearchAsync(SearchLeadRequest request, CancellationToken cancellationToken = default)
    {
        var query = BuildLeadQuery(request);
        var projected = query.Select(x => new ViewLeadListResponse
        {
            Id = x.Id,
            BusinessName = x.BusinessName,
            OwnerName = x.LeadContacts.Where(c => c.IsPrimary).Select(c => c.OwnerName).FirstOrDefault() ?? string.Empty,
            Mobile = x.LeadContacts.Where(c => c.IsPrimary).Select(c => c.Mobile).FirstOrDefault() ?? string.Empty,
            BusinessType = x.BusinessType,
            CurrentPOS = x.CurrentPOS,
            AssignedToUserId = x.FKAssignedToUserId,
            LeadStatus = x.LeadStatus,
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
            .Include(x => x.LeadStatusHistories)
            .Include(x => x.LeadAssignmentHistories)
            .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

        _ = lead ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Lead"));

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
        await ValidateDuplicatesAsync(request.Mobile, request.Email, request.GstNumber, null, cancellationToken);

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
            LeadSource = request.LeadSource,
            FKAssignedToUserId = request.AssignedToUserId,
            Priority = request.Priority,
            LeadStatus = request.LeadStatus,
            ExpectedClosingDate = request.ExpectedClosingDate,
            InterestLevel = request.InterestLevel,
            Country = request.Country,
            State = request.State,
            City = request.City,
            Area = request.Area,
            Pincode = request.Pincode,
            FullAddress = request.FullAddress,
            GoogleMapsLink = request.GoogleMapsLink,
            PainPoints = request.PainPoints,
            Competitors = request.Competitors,
            Requirements = request.Requirements,
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
                    FromStatus = null,
                    ToStatus = request.LeadStatus,
                    ChangedByUserId = _currentUser.GetUserId().ToString(),
                    ChangedOn = _dateTimeService.UtcNow,
                }
            ],
            LeadAssignmentHistories =
            [
                new LeadAssignmentHistories
                {
                    FromUserId = null,
                    ToUserId = request.AssignedToUserId,
                    AssignedByUserId = _currentUser.GetUserId().ToString(),
                    AssignedOn = _dateTimeService.UtcNow,
                }
            ],
        };

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

        await ValidateDuplicatesAsync(request.Mobile, request.Email, request.GstNumber, id, cancellationToken);

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
        lead.LeadSource = request.LeadSource;
        lead.FKAssignedToUserId = request.AssignedToUserId;
        lead.Priority = request.Priority;
        lead.LeadStatus = request.LeadStatus;
        lead.ExpectedClosingDate = request.ExpectedClosingDate;
        lead.InterestLevel = request.InterestLevel;
        lead.Country = request.Country;
        lead.State = request.State;
        lead.City = request.City;
        lead.Area = request.Area;
        lead.Pincode = request.Pincode;
        lead.FullAddress = request.FullAddress;
        lead.GoogleMapsLink = request.GoogleMapsLink;
        lead.PainPoints = request.PainPoints;
        lead.Competitors = request.Competitors;
        lead.Requirements = request.Requirements;
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

        await _db.SaveChangesAsync(cancellationToken);
        return SuccessMessages.CommonRecordUpdated;
    }

    public async Task<string> UpdateStatusAsync(DefaultIdType id, UpdateLeadStatusRequest request, CancellationToken cancellationToken = default)
    {
        var lead = await _db.Leads.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        _ = lead ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Lead"));

        var fromStatus = lead.LeadStatus;
        lead.LeadStatus = request.LeadStatus;

        if (request.LeadStatus == LeadStatus.Won)
        {
            lead.ConvertedOn = _dateTimeService.UtcNow;
        }

        await _db.LeadStatusHistories.AddAsync(new LeadStatusHistories
        {
            FKLeadPKId = lead.Id,
            FromStatus = fromStatus,
            ToStatus = request.LeadStatus,
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

        var fromUserId = lead.FKAssignedToUserId;
        lead.FKAssignedToUserId = request.AssignedToUserId;

        await _db.LeadAssignmentHistories.AddAsync(new LeadAssignmentHistories
        {
            FKLeadPKId = lead.Id,
            FromUserId = fromUserId,
            ToUserId = request.AssignedToUserId,
            AssignedByUserId = _currentUser.GetUserId().ToString(),
            AssignedOn = _dateTimeService.UtcNow,
            Remarks = request.Remarks,
        }, cancellationToken);

        await _db.SaveChangesAsync(cancellationToken);
        return SuccessMessages.CommonRecordUpdated;
    }

    public async Task<List<ViewLeadListResponse>> GetTodayFollowUpsAsync(CancellationToken cancellationToken = default)
    {
        var today = _dateTimeService.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        return await _db.Leads
            .AsNoTracking()
            .Where(x => x.NextFollowUpDate >= today && x.NextFollowUpDate < tomorrow && !x.IsArchived)
            .Select(x => new ViewLeadListResponse
            {
                Id = x.Id,
                BusinessName = x.BusinessName,
                OwnerName = x.LeadContacts.Where(c => c.IsPrimary).Select(c => c.OwnerName).FirstOrDefault() ?? string.Empty,
                Mobile = x.LeadContacts.Where(c => c.IsPrimary).Select(c => c.Mobile).FirstOrDefault() ?? string.Empty,
                BusinessType = x.BusinessType,
                CurrentPOS = x.CurrentPOS,
                AssignedToUserId = x.FKAssignedToUserId,
                LeadStatus = x.LeadStatus,
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

        return await _db.Leads
            .AsNoTracking()
            .Where(x => x.NextFollowUpDate < today
                && x.LeadStatus != LeadStatus.Won
                && x.LeadStatus != LeadStatus.Lost
                && !x.IsArchived)
            .Select(x => new ViewLeadListResponse
            {
                Id = x.Id,
                BusinessName = x.BusinessName,
                OwnerName = x.LeadContacts.Where(c => c.IsPrimary).Select(c => c.OwnerName).FirstOrDefault() ?? string.Empty,
                Mobile = x.LeadContacts.Where(c => c.IsPrimary).Select(c => c.Mobile).FirstOrDefault() ?? string.Empty,
                BusinessType = x.BusinessType,
                CurrentPOS = x.CurrentPOS,
                AssignedToUserId = x.FKAssignedToUserId,
                LeadStatus = x.LeadStatus,
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
        await EnsureLeadExistsAsync(leadId, cancellationToken);

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
        await EnsureLeadExistsAsync(leadId, cancellationToken);

        return await _db.EntityNotes
            .AsNoTracking()
            .Where(n => n.FKEntityPKId == leadId && (n.EntityNoteType == EntityNoteType.Lead || n.EntityNoteType == EntityNoteType.LeadSummary))
            .OrderByDescending(n => n.CreatedOn)
            .ProjectToType<ViewEntityNoteResponse>()
            .ToListAsync(cancellationToken);
    }

    public async Task<ViewEntityNoteResponse> CreateNoteAsync(DefaultIdType leadId, CreateEntityNoteRequest request, CancellationToken cancellationToken = default)
    {
        await EnsureLeadExistsAsync(leadId, cancellationToken);

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

    private IQueryable<Leads> BuildLeadQuery(SearchLeadRequest request)
    {
        var query = _db.Leads.AsNoTracking().AsQueryable();
        var userId = _currentUser.GetUserId().ToString();
        var today = _dateTimeService.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        switch (request.FilterType)
        {
            case LeadFilterType.MyLeads:
                query = query.Where(x => x.FKAssignedToUserId == userId);
                break;
            case LeadFilterType.TodayFollowUps:
                query = query.Where(x => x.NextFollowUpDate >= today && x.NextFollowUpDate < tomorrow);
                break;
            case LeadFilterType.Overdue:
                query = query.Where(x => x.NextFollowUpDate < today
                    && x.LeadStatus != LeadStatus.Won
                    && x.LeadStatus != LeadStatus.Lost);
                break;
            case LeadFilterType.Interested:
                query = query.Where(x => x.InterestLevel == InterestLevel.High);
                break;
            case LeadFilterType.Won:
                query = query.Where(x => x.LeadStatus == LeadStatus.Won);
                break;
            case LeadFilterType.Lost:
                query = query.Where(x => x.LeadStatus == LeadStatus.Lost);
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
            query = query.Where(x => x.FKAssignedToUserId == request.AssignedToUserId);
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

    private async Task EnsureLeadExistsAsync(DefaultIdType leadId, CancellationToken cancellationToken)
    {
        var exists = await _db.Leads.AnyAsync(x => x.Id == leadId, cancellationToken);
        if (!exists)
        {
            throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Lead"));
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
            LeadSource = lead.LeadSource,
            AssignedToUserId = lead.FKAssignedToUserId,
            Priority = lead.Priority,
            LeadStatus = lead.LeadStatus,
            ExpectedClosingDate = lead.ExpectedClosingDate,
            InterestLevel = lead.InterestLevel,
            PainPoints = lead.PainPoints,
            Competitors = lead.Competitors,
            Requirements = lead.Requirements,
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
                .Adapt<List<ViewLeadStatusHistoryResponse>>(),
            AssignmentHistories = lead.LeadAssignmentHistories
                .OrderByDescending(h => h.AssignedOn)
                .Adapt<List<ViewLeadAssignmentHistoryResponse>>(),
        };
    }
}
