using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.FileStorage;
using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Application.Common.Models;
using FlowPilot.Application.CRM;
using FlowPilot.Application.CRM.Model.Request.LeadVisit;
using FlowPilot.Application.CRM.Model.Response.LeadVisit;
using FlowPilot.Domain.CRM;
using FlowPilot.Domain.Enums;
using FlowPilot.Domain.Enums.CRM;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Infrastructure.SystemConstants;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Orbit.CRM;

public class LeadVisitService : ILeadVisitService
{
    private readonly ApplicationDbContext _db;
    private readonly IFileStorageService _fileStorage;
    private readonly IDateTimeService _dateTimeService;
    private readonly ILeadService _leadService;

    public LeadVisitService(
        ApplicationDbContext db,
        IFileStorageService fileStorage,
        IDateTimeService dateTimeService,
        ILeadService leadService)
    {
        _db = db;
        _fileStorage = fileStorage;
        _dateTimeService = dateTimeService;
        _leadService = leadService;
    }

    public async Task<PaginationResponse<ViewLeadVisitResponse>> SearchAsync(SearchLeadVisitRequest request, CancellationToken cancellationToken = default)
    {
        var query = _db.LeadVisits.AsNoTracking().AsQueryable();

        if (request.FKLeadPKId.HasValue)
        {
            query = query.Where(x => x.FKLeadPKId == request.FKLeadPKId.Value);
        }

        var projected = query
            .OrderByDescending(x => x.VisitTime)
            .Select(x => new ViewLeadVisitResponse
            {
                Id = x.Id,
                FKLeadPKId = x.FKLeadPKId,
                VisitTime = x.VisitTime,
                CreatedOn = x.CreatedOn,
                GpsLogs = x.GpsLogs.Select(g => new ViewGpsLogResponse
                {
                    Id = g.Id,
                    Latitude = g.Latitude,
                    Longitude = g.Longitude,
                    LoggedAt = g.LoggedAt,
                    DistanceMeters = g.Verification != null ? g.Verification.DistanceMeters : (decimal?)null,
                    Status = g.Verification != null ? g.Verification.Status : (VerificationStatus?)null,
                }).ToList(),
                Images = x.Images.Select(i => new ViewLeadImageResponse
                {
                    Id = i.Id,
                    ImageUrl = i.ImageUrl,
                    Caption = i.Caption,
                }).ToList(),
            });

        return await projected.PaginatedListAsync<ViewLeadVisitResponse, ViewLeadVisitResponse>(request.PageNumber, request.PageSize);
    }

    public async Task<ViewLeadVisitResponse> GetByIdAsync(DefaultIdType id, CancellationToken cancellationToken = default)
    {
        var visit = await _db.LeadVisits
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new ViewLeadVisitResponse
            {
                Id = x.Id,
                FKLeadPKId = x.FKLeadPKId,
                VisitTime = x.VisitTime,
                CreatedOn = x.CreatedOn,
                GpsLogs = x.GpsLogs.Select(g => new ViewGpsLogResponse
                {
                    Id = g.Id,
                    Latitude = g.Latitude,
                    Longitude = g.Longitude,
                    LoggedAt = g.LoggedAt,
                    DistanceMeters = g.Verification != null ? g.Verification.DistanceMeters : (decimal?)null,
                    Status = g.Verification != null ? g.Verification.Status : (VerificationStatus?)null,
                }).ToList(),
                Images = x.Images.Select(i => new ViewLeadImageResponse
                {
                    Id = i.Id,
                    ImageUrl = i.ImageUrl,
                    Caption = i.Caption,
                }).ToList(),
            })
            .SingleOrDefaultAsync(cancellationToken);

        _ = visit ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Lead visit"));

        return visit;
    }

    public async Task<CreateLeadVisitResponse> CreateAsync(
        CreateLeadVisitRequest request,
        CancellationToken cancellationToken = default,
        decimal? referenceLatitude = null,
        decimal? referenceLongitude = null)
    {
        var lead = await _db.Leads
            .AsNoTracking()
            .Where(x => x.Id == request.FKLeadPKId)
            .Select(x => new { x.Id, x.Latitude, x.Longitude })
            .SingleOrDefaultAsync(cancellationToken);

        _ = lead ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Lead"));

        var refLatitude = referenceLatitude ?? lead.Latitude;
        var refLongitude = referenceLongitude ?? lead.Longitude;

        var visit = new LeadVisits
        {
            FKLeadPKId = request.FKLeadPKId,
            VisitTime = request.VisitTime,
        };

        foreach (var gps in request.GpsLogs ?? [])
        {
            visit.GpsLogs.Add(BuildGpsLog(gps, refLatitude, refLongitude));
        }

        foreach (var image in request.Images)
        {
            var imageUrl = await _fileStorage.UploadAsync<LeadVisits>(image.Image, FileType.Image, cancellationToken);
            visit.Images.Add(new LeadImages
            {
                ImageUrl = imageUrl,
                Caption = image.Caption,
            });
        }

        await _db.LeadVisits.AddAsync(visit, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        return new CreateLeadVisitResponse
        {
            Id = visit.Id,
            Message = SuccessMessages.CommonRecordCreated,
        };
    }

    public async Task<CreateLeadWithVisitResponse> CreateWithLeadAsync(CreateLeadWithVisitRequest request, CancellationToken cancellationToken = default)
    {
        var leadResponse = await _leadService.CreateAsync(request.Lead, cancellationToken);

        var visitResponse = await CreateAsync(
            new CreateLeadVisitRequest
            {
                FKLeadPKId = leadResponse.Id,
                VisitTime = request.VisitTime,
                GpsLogs = request.GpsLogs,
                Images = request.Images,
            },
            cancellationToken,
            request.Lead.Latitude,
            request.Lead.Longitude);

        return new CreateLeadWithVisitResponse
        {
            LeadId = leadResponse.Id,
            LeadVisitId = visitResponse.Id,
            Message = SuccessMessages.CommonRecordCreated,
        };
    }

    public async Task<UpdateLeadWithVisitResponse> UpdateWithLeadAsync(
        DefaultIdType id,
        UpdateLeadWithVisitRequest request,
        CancellationToken cancellationToken = default)
    {
        var visit = await _db.LeadVisits.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        _ = visit ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Lead visit"));

        request.Lead.Id = visit.FKLeadPKId;

        await _leadService.UpdateAsync(visit.FKLeadPKId, request.Lead, cancellationToken);

        visit.VisitTime = request.VisitTime;

        var refLatitude = request.Lead.Latitude;
        var refLongitude = request.Lead.Longitude;

        foreach (var gps in request.GpsLogs ?? [])
        {
            var gpsLog = BuildGpsLog(gps, refLatitude, refLongitude);
            gpsLog.FKLeadVisitPKId = visit.Id;
            await _db.GpsLogs.AddAsync(gpsLog, cancellationToken);
        }

        await _db.SaveChangesAsync(cancellationToken);

        return new UpdateLeadWithVisitResponse
        {
            LeadId = visit.FKLeadPKId,
            LeadVisitId = visit.Id,
            Message = SuccessMessages.CommonRecordUpdated,
        };
    }

    public async Task<ViewGpsLogResponse> LogGpsAsync(DefaultIdType id, LogGpsRequest request, CancellationToken cancellationToken = default)
    {
        var visit = await _db.LeadVisits.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        _ = visit ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Lead visit"));

        var lead = await _db.Leads
            .AsNoTracking()
            .Where(x => x.Id == visit.FKLeadPKId)
            .Select(x => new { x.Latitude, x.Longitude })
            .SingleOrDefaultAsync(cancellationToken);

        _ = lead ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Lead"));

        var gpsLog = BuildGpsLog(request, lead.Latitude, lead.Longitude);
        gpsLog.FKLeadVisitPKId = visit.Id;

        await _db.GpsLogs.AddAsync(gpsLog, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        return new ViewGpsLogResponse
        {
            Id = gpsLog.Id,
            Latitude = gpsLog.Latitude,
            Longitude = gpsLog.Longitude,
            LoggedAt = gpsLog.LoggedAt,
            DistanceMeters = gpsLog.Verification?.DistanceMeters,
            Status = gpsLog.Verification?.Status,
        };
    }

    public async Task<ViewLeadImageResponse> AddImageAsync(DefaultIdType id, AddLeadVisitImageRequest request, CancellationToken cancellationToken = default)
    {
        var visit = await _db.LeadVisits.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        _ = visit ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Lead visit"));

        var imageUrl = await _fileStorage.UploadAsync<LeadVisits>(request.Image, FileType.Image, cancellationToken);

        var image = new LeadImages
        {
            FKLeadVisitPKId = visit.Id,
            ImageUrl = imageUrl,
            Caption = request.Caption,
        };

        await _db.LeadImages.AddAsync(image, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        return new ViewLeadImageResponse
        {
            Id = image.Id,
            ImageUrl = image.ImageUrl,
            Caption = image.Caption,
        };
    }

    public async Task<string> DeleteAsync(DefaultIdType id, CancellationToken cancellationToken = default)
    {
        var visit = await _db.LeadVisits.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        _ = visit ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Lead visit"));

        visit.IsDeleted = true;
        await _db.SaveChangesAsync(cancellationToken);

        return string.Format(SuccessMessages.RecordDeletedSuccessfully, "Lead visit");
    }

    private GpsLogs BuildGpsLog(LogGpsRequest request, decimal? referenceLatitude, decimal? referenceLongitude)
    {
        var gpsLog = new GpsLogs
        {
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            LoggedAt = request.LoggedAt == default ? _dateTimeService.UtcNow : request.LoggedAt,
            Verification = new GpsVerifications(),
        };

        GpsVerificationHelper.Apply(
            gpsLog.Verification,
            request.Latitude,
            request.Longitude,
            referenceLatitude,
            referenceLongitude);

        return gpsLog;
    }
}
