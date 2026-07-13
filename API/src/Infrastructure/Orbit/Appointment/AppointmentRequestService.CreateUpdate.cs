using FlowPilot.Application.Appointment.Models.Request;
using FlowPilot.Application.Appointment.Models.Response;
using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Setting.Models;
using FlowPilot.Domain.Appointment;
using FlowPilot.Domain.Enums.Appointment;
using FlowPilot.Infrastructure.SystemConstants;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Orbit.Appointment;
public partial class AppointmentRequestService
{
    public async Task<CreateAppointmentResponse> CreateAppointmentRequest(CreateAppointmentRequest request, bool isReschedule)
    {
        if (request.AppointmentParticipants.Count == 0)
            throw new BadRequestException(string.Format(ErrorMessages.AppointmentParticipantRequired));

        if (request.AppointmentAvailabilityWindows.Count == 0)
            throw new BadRequestException(string.Format(ErrorMessages.AppointmentAvailabilityWindows));

        var currentDateTimeOffset = DateTimeOffset.Now;

        if (request.AppointmentAvailabilityWindows.Any(x => x.OnDate < currentDateTimeOffset.Date))
            throw new BadRequestException(string.Format(ErrorMessages.SelectPastDate));

        if (request.AppointmentAvailabilityWindows.Any(x => x.TimeFrom < currentDateTimeOffset) || request.AppointmentAvailabilityWindows.Any(x => x.TimeFrom < currentDateTimeOffset))
            throw new BadRequestException(string.Format(ErrorMessages.SelectPastTime));

        var entity = new TempAppointments
        {
            Title = request.Title,
            Description = request.Description,
            DurationMinutes = request.DurationMinutes,
            ApprovalRule = request.ApprovalRule,
            LocationType = request.LocationType,
            AppointmentStatus = AppointmentStatus.Proposing,
            MultipleParticipantPerSlot = request.MultipleParticipantPerSlot <= 0 ? 1 : request.MultipleParticipantPerSlot,
            TempAppointmentParticipants = request.AppointmentParticipants.Select(x => new TempAppointmentParticipants
            {
                UrlIdentifier = _urlService.GenerateUrlIdentifier(100),
                FKTempAppointmentsPKId = 0,
                FKApplicationUserPKId = x.FKApplicationUserPKId,
                AppointmentParticipantRole = x.AppointmentParticipantRole,
                AppointmentParticipantResponseStatus = AppointmentParticipantResponseStatus.Pending,
                TimeZone = x.TimeZone,
                MeetingUrlIdentifier = _urlService.GenerateUrlIdentifier(100),
                MeetingParticipantPresenceStatus = MeetingParticipantPresenceStatus.NotJoined,
            }).ToList(),
            TempAppointmentAvailabilityWindows = request.AppointmentAvailabilityWindows.Select(x => new TempAppointmentAvailabilityWindow
            {
                FKTempAppointmentsPKId = 0,
                OnDate = _DateTimeOffsetService.ConvertToUTCDate(x.OnDate),
                TimeFrom = _DateTimeOffsetService.ConvertToUTCDate(x.TimeFrom),
                TimeTo = _DateTimeOffsetService.ConvertToUTCDate(x.TimeTo),
            }).ToList(),
        };

        var hostUserDetail = await _userService.GetAsync(_currentUser.GetUserId().ToString(),new CancellationToken());

        // Adding creator as Host and auto accepted
        entity.TempAppointmentParticipants.Add(new TempAppointmentParticipants
        {
            AppointmentParticipantResponseStatus = AppointmentParticipantResponseStatus.Accepted,
            AppointmentParticipantRole = AppointmentParticipantRole.Host,
            FKApplicationUserPKId = _currentUser.GetUserId().ToString(),
            FKTempAppointmentsPKId = 0,
            UrlIdentifier = _urlService.GenerateUrlIdentifier(100),
            TimeZone = hostUserDetail.TimeZone,
            MeetingUrlIdentifier = _urlService.GenerateUrlIdentifier(100),
            MeetingParticipantPresenceStatus = MeetingParticipantPresenceStatus.NotJoined,
        });

        await _applicationDbContext.TempAppointments.AddAsync(entity);
        await _applicationDbContext.SaveChangesAsync();

        await ExecuteAppointmentApprovalRule(entity.Id);

        if (!isReschedule)
        {
            _jobService.Enqueue(() => _mailService.SendAppointmentCreatedEmail(entity.Id));
        }

        await SetAppointmentRequestReminders(entity.Id);
        SetAutoCancelAppointmentSchedule(entity);

        return new CreateAppointmentResponse { Message = SuccessMessages.RecordAddedSuccessfully, Id = entity.Id };

    }

    public async Task<List<ViewAppointments>> ViewAppointments(SearchAppointmentsRequest request)
    {
        var query = _applicationDbContext.TempAppointments.AsQueryable();

        var start = request.StartDate.Date.AddDays(-1);
        var end = request.EndDate.Date;

        query = query.Where(x =>
            x.TempAppointmentAvailabilityWindows.Any(a => a.OnDate.Date >= start && a.OnDate < end )
        );

        if (request.AppointmentStatus.HasValue)
        {
            query = query.Where(x => x.AppointmentStatus == request.AppointmentStatus);
        }

        if (request.LocationType.HasValue)
        {
            query = query.Where(x => x.LocationType == request.LocationType);
        }

        if (!string.IsNullOrEmpty(request.SearchText))
        {
            query = query.Where(x => x.Title.Contains(request.SearchText));
        }

        if (!string.IsNullOrEmpty(request.HostUserId))
        {
            query = query.Where(x => _applicationDbContext.TempAppointmentParticipants.Any(p =>
                p.FKTempAppointmentsPKId == x.Id &&
                p.FKApplicationUserPKId == request.HostUserId &&
                p.AppointmentParticipantRole == AppointmentParticipantRole.Host));
        }

        if (!string.IsNullOrEmpty(request.GuestUserId))
        {
            query = query.Where(x => _applicationDbContext.TempAppointmentParticipants.Any(p =>
                p.FKTempAppointmentsPKId == x.Id &&
                p.FKApplicationUserPKId == request.GuestUserId));
        }

        // if above both are not sent then only filter where logged in user is there
        if (string.IsNullOrEmpty(request.GuestUserId) && string.IsNullOrEmpty(request.HostUserId))
        {
            query = query.Where(x => _applicationDbContext.TempAppointmentParticipants.Any(p =>
                        p.FKTempAppointmentsPKId == x.Id &&
                        p.FKApplicationUserPKId == _currentUser.GetUserId().ToString()));
        }

        var result = await query.Select(entity => new ViewAppointments
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            DurationMinutes = entity.DurationMinutes,
            AppointmentStatus = entity.AppointmentStatus,
            LocationType = entity.LocationType,
            CancellationReason = entity.CancellationReason,
            CancelledBy = entity.FKCancelledByApplicationUserPKId,

        }).ToListAsync();

        if (result.Count == 0)
            return result;

        DefaultIdType[] appointmentIds = result.Select(x => x.Id).ToArray();

        var appointmentParticipants = _applicationDbContext.TempAppointmentParticipants.Where(x => appointmentIds.Contains(x.FKTempAppointmentsPKId)).ToList();
        var appointmentAvailabilityProposedWindows = _applicationDbContext.TempAppointmentAvailabilityProposedWindow.Include(x => x.TempAppointmentParticipant).Where(x => appointmentIds.Contains(x.FKTempAppointmentsPKId)).ToList();
        var appointmentAvailabilityWindow = _applicationDbContext.TempAppointmentAvailabilityWindow.Where(x => appointmentIds.Contains(x.FKTempAppointmentsPKId)).ToList();
        var userIds = appointmentParticipants.Select(x => x.FKApplicationUserPKId).ToList();

        if (appointmentAvailabilityProposedWindows != null)
        {
            userIds.AddRange(appointmentAvailabilityProposedWindows.Select(x => x.TempAppointmentParticipant.FKApplicationUserPKId).ToList());
        }

        var viewUserDetails = await _userService.GetUserDetails(userIds.ToArray(), true);

        foreach (var d in result)
        {
            if (!string.IsNullOrEmpty(d.CancelledBy))
            {
                d.CancelledBy = viewUserDetails.Where(y => y.Id.ToString() == d.CancelledBy).Select(y => $"{y.FirstName} {y.LastName}").First();
            }

            d.AppointmentParticipants = appointmentParticipants.Where(x => x.FKTempAppointmentsPKId == d.Id).Select(x => new ViewAppointmentParticipantResponse
            {
                Id = x.Id,
                AppointmentParticipantRole = x.AppointmentParticipantRole,
                ParticipantDetail = viewUserDetails.First(y => y.Id.ToString() == x.FKApplicationUserPKId),
                AppointmentParticipantResponseStatus = x.AppointmentParticipantResponseStatus,
                DeclinedReason = x.DeclinedReason,
                DeclinedAt = x.DeclinedAt,
                ApproveForDate = x.ApproveForDate,
                ApproveTimeFrom = x.ApproveTimeFrom,
                ApproveTimeTo = x.ApproveTimeTo,
                TimeZone = x.TimeZone
            }).ToList();

            d.AvailabilityWindow = appointmentAvailabilityWindow.Where(x => x.FKTempAppointmentsPKId == d.Id).Select(x => new ViewAppointmentAvailabilityWindowResponse
            {
                Id = x.Id,
                OnDate = x.OnDate,
                TimeFrom = x.TimeFrom,
                TimeTo = x.TimeTo,
            }).ToList();

            if (appointmentAvailabilityProposedWindows != null)
            {
                d.AvailabilityProposedWindow = appointmentAvailabilityProposedWindows.Where(x => x.FKTempAppointmentsPKId == d.Id).Select(x => new ViewAppointmentAvailabilityProposedWindow
                {
                    Id = x.Id,
                    OnDate = x.OnDate,
                    TimeFrom = x.TimeFrom,
                    TimeTo = x.TimeTo,
                    ProposedParticipantDetail = viewUserDetails.First(y => y.Id.ToString() == x.TempAppointmentParticipant.FKApplicationUserPKId),
                    AppointmentAvailabilityProposedWindowStatus = x.AppointmentAvailabilityProposedWindowStatus,
                }).ToList();
            }
        }

        return result;
    }

    public async Task<ViewAppointmentRequestResponse> ViewAppointmentRequestById(DefaultIdType id)
    {
        var entity = await _applicationDbContext.TempAppointments
            .Include(x => x.TempAppointmentParticipants)
            .Include(x => x.TempAppointmentAvailabilityWindows)
            .Include(x => x.TempAppointmentAvailabilityProposedWindows)
            .ThenInclude(x => x.TempAppointmentParticipant)
            .SingleOrDefaultAsync(x => x.Id == id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "appointment"));

        var userIds = entity.TempAppointmentParticipants.Select(x => x.FKApplicationUserPKId).ToList();
        if (entity.TempAppointmentAvailabilityProposedWindows != null)
        {
            userIds.AddRange(entity.TempAppointmentAvailabilityProposedWindows.Select(x => x.TempAppointmentParticipant.FKApplicationUserPKId).ToList());
        }

        var viewUserDetails = await _userService.GetUserDetails(userIds.ToArray(), true);

        var response = new ViewAppointmentRequestResponse
        {
            Id = id,
            Title = entity.Title,
            Description = entity.Description,
            DurationMinutes = entity.DurationMinutes,
            ApprovalRule = entity.ApprovalRule,
            LocationType = entity.LocationType,
            AppointmentStatus = entity.AppointmentStatus,
            CancellationReason = entity.CancellationReason,
            CancelledBy = string.IsNullOrEmpty(entity.FKCancelledByApplicationUserPKId) ? string.Empty : viewUserDetails.Where(y => y.Id.ToString() == entity.FKCancelledByApplicationUserPKId).Select(y => $"{y.FirstName} {y.LastName}").First(),
            MultipleParticipantPerSlot = entity.MultipleParticipantPerSlot,
            AppointmentParticipants = entity.TempAppointmentParticipants.Select(x => new ViewAppointmentParticipantResponse
            {
                Id = x.Id,
                AppointmentParticipantRole = x.AppointmentParticipantRole,
                ParticipantDetail = viewUserDetails.First(y => y.Id.ToString() == x.FKApplicationUserPKId),
                AppointmentParticipantResponseStatus = x.AppointmentParticipantResponseStatus,
                DeclinedReason = x.DeclinedReason,
                DeclinedAt = x.DeclinedAt,
                ApproveForDate = x.ApproveForDate,
                ApproveTimeFrom = x.ApproveTimeFrom,
                ApproveTimeTo = x.ApproveTimeTo,
                TimeZone = x.TimeZone,
            }).ToList(),
            AvailabilityWindow = entity.TempAppointmentAvailabilityWindows.Select(x => new ViewAppointmentAvailabilityWindowResponse
            {
                Id = x.Id,
                OnDate = x.OnDate,
                TimeFrom = x.TimeFrom,
                TimeTo = x.TimeTo,
            }).ToList(),
            AvailabilityProposedWindow = entity.TempAppointmentAvailabilityProposedWindows?.Select(x => new ViewAppointmentAvailabilityProposedWindow
            {
                Id = x.Id,
                OnDate = x.OnDate,
                TimeFrom = x.TimeFrom,
                TimeTo = x.TimeTo,
                ProposedParticipantDetail = viewUserDetails.First(y => y.Id.ToString() == x.TempAppointmentParticipant.FKApplicationUserPKId),
                AppointmentAvailabilityProposedWindowStatus = x.AppointmentAvailabilityProposedWindowStatus,
            }).ToList()
        };

        return response;

    }

    private void SetAutoCancelAppointmentSchedule(TempAppointments tempAppointmentDetail)
    {
        var availabilityWindows = tempAppointmentDetail.TempAppointmentAvailabilityWindows;

        if (tempAppointmentDetail.AppointmentStatus != AppointmentStatus.Proposing)
            return;

        var lastSlotStart = availabilityWindows
            .Select(w => w.OnDate.Date + w.TimeFrom.TimeOfDay)
            .Max();
        var delay = lastSlotStart.AddHours(3);
        _jobService.Schedule(
            () => SystemCancelAppointmentSchedule(tempAppointmentDetail.Id), delay);
    }

    public async Task SystemCancelAppointmentSchedule(DefaultIdType appointmentId)
    {
        var tempAppointmentDetail = await _applicationDbContext.TempAppointments
       .Include(x => x.TempAppointmentParticipants).SingleOrDefaultAsync(x => x.Id == appointmentId);

        if (tempAppointmentDetail == null)
        {
            return;
        }

        if (tempAppointmentDetail.AppointmentStatus != AppointmentStatus.Proposing)
        {
            return;
        }

        bool everyonePending = tempAppointmentDetail.TempAppointmentParticipants.All(
        p => p.AppointmentParticipantResponseStatus == AppointmentParticipantResponseStatus.Pending);

        if (!everyonePending)
        {
            // Someone responded — don’t auto-cancel
            return;
        }

        var entity = await _applicationDbContext.TempAppointments.SingleAsync(x => x.Id == appointmentId);
        entity.AppointmentStatus = AppointmentStatus.SystemCancelled;
        _applicationDbContext.TempAppointments.Update(entity);
        await _applicationDbContext.SaveChangesAsync();

        await _mailService.SendSystemCancellationAppointmentScheduleEmail(appointmentId);
    }

    public async Task<string> CancelAppointment(CancelAppointmentRequest request)
    {
        var entity = await _applicationDbContext.TempAppointments.SingleAsync(x => x.Id == request.FKTempAppointmentsPKId);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "appointment"));

        if (entity.AppointmentStatus == AppointmentStatus.Cancelled) throw new BadRequestException(string.Format(ErrorMessages.AppointmentStatusAlreadyCanceled));

        entity.AppointmentStatus = AppointmentStatus.Cancelled;
        entity.CancellationReason = request.CancellationReason;
        entity.FKCancelledByApplicationUserPKId = _currentUser.GetUserId().ToString();
        _applicationDbContext.TempAppointments.Update(entity);

        await _applicationDbContext.SaveChangesAsync();

        await _mailService.SendCancellationAppointmentScheduleEmail(request.FKTempAppointmentsPKId);
        return SuccessMessages.AppointmentCanceledSuccessfully;
    }

    public async Task<CreateAppointmentResponse> RescheduleAppointmentRequest(RescheduleAppointmentRequest request)
    {
        var entity = await _applicationDbContext.TempAppointments.SingleAsync(x => x.Id == request.FKTempAppointmentsPKId);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Appointment"));

        if (entity.AppointmentStatus == AppointmentStatus.Rescheduled) throw new BadRequestException(string.Format(ErrorMessages.AppointmentStatusAlreadyRescheduled));

        if (request.AppointmentParticipants.Count == 0) throw new BadRequestException(string.Format(ErrorMessages.AppointmentParticipantRequired));

        if (request.AppointmentAvailabilityWindows.Count == 0) throw new BadRequestException(string.Format(ErrorMessages.AppointmentParticipantRequired));

        entity.AppointmentStatus = AppointmentStatus.Rescheduled;

        _applicationDbContext.TempAppointments.Update(entity);
        await _applicationDbContext.SaveChangesAsync();

        var result = await CreateAppointmentRequest(
            new CreateAppointmentRequest
            {
                Title = request.Title,
                Description = request.Description,
                DurationMinutes = request.DurationMinutes,
                ApprovalRule = request.ApprovalRule,
                LocationType = request.LocationType,
                AppointmentParticipants = request.AppointmentParticipants,
                AppointmentAvailabilityWindows = request.AppointmentAvailabilityWindows,
                MultipleParticipantPerSlot = request.MultipleParticipantPerSlot,
            }, true);

        var appointment = await _applicationDbContext.TempAppointments.SingleAsync(x => x.Id == result.Id);
        appointment.FKTempAppointmentPkId = request.FKTempAppointmentsPKId;

        _applicationDbContext.TempAppointments.Update(entity);
        await _applicationDbContext.SaveChangesAsync();

        _jobService.Enqueue(() => _mailService.SendRescheduleAppointmentCreatedEmail(appointment.Id));

        return result;
    }

    public async Task SetAppointmentRequestReminders(DefaultIdType appointmentId)
    {
        var appointmentSetting = await _settingService.GetSettingByCodeAsync<AppointmentSettingModels>(Domain.Enums.SettingTypes.Appointment);

        if (appointmentSetting.ReminderAfterDays == null || appointmentSetting.ReminderAfterDays.Count == 0)
        {
            return;
        }

        var tempAppointmentDetail = await _applicationDbContext.TempAppointments
            .Include(x => x.TempAppointmentParticipants)
            .Include(x => x.TempAppointmentAvailabilityWindows)
            .SingleOrDefaultAsync(x => x.Id == appointmentId);

        if (tempAppointmentDetail.AppointmentStatus != AppointmentStatus.Proposing)
            return;

        var availabilityWindows = tempAppointmentDetail.TempAppointmentAvailabilityWindows;

        // Last slot start = max(OnDate + TimeFrom)
        var lastSlotStart = availabilityWindows
            .Select(w => w.OnDate.Date + w.TimeFrom.TimeOfDay)
            .Max();

        var now = DateTimeOffset.Now;
        var times = new HashSet<DateTimeOffset>();

        // N-day candidates
        var nDayCandidates = (appointmentSetting.ReminderAfterDays ?? new List<int>())
            .Distinct()
            .OrderBy(d => d)
            .Select(d => tempAppointmentDetail.CreatedOn.AddDays(d))
            .Where(t => t < lastSlotStart)
            .ToList();

        if (nDayCandidates.Count > 0)
        {
            // If all configured N-day reminders fit before last slot -> keep all; else keep only earliest
            bool allFit = appointmentSetting.ReminderAfterDays != null
             && appointmentSetting.ReminderAfterDays.Distinct().Count() == nDayCandidates.Count;
            if (allFit)
                foreach (var t in nDayCandidates) times.Add(t);
            else
                times.Add(nDayCandidates.First());
        }

        // Final reminder: day before last slot, same time-of-day as 'scheduledAt'
        if (appointmentSetting.IncludeFinalReminderBeforeAppointment)
        {
            var final = lastSlotStart.Date.AddDays(-1)
                         .AddHours(tempAppointmentDetail.CreatedOn.Hour)
                         .AddMinutes(tempAppointmentDetail.CreatedOn.Minute)
                         .AddSeconds(tempAppointmentDetail.CreatedOn.Second);

            if (final < lastSlotStart && !times.Any(t => t.Date == final.Date)) times.Add(final);
        }

        // Send reminder email
        foreach (var t in times.OrderBy(x => x))
        {
            var delay = t - now;
            if (delay <= TimeSpan.Zero) continue;

            _jobService.Schedule(() => _mailService.SendAppointmentCreatedReminderEmail(appointmentId, false), delay);
        }
    }
}