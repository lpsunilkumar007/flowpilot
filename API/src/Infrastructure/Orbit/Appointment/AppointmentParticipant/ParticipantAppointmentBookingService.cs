using FlowPilot.Application.Appointment;
using FlowPilot.Application.Appointment.Models.Request.AppointmentParticipant;
using FlowPilot.Application.Appointment.Models.Request.Jitsi;
using FlowPilot.Application.Appointment.Models.Response.AppointmentParticipant;
using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Application.Common.Mailing;
using FlowPilot.Application.ExternalIntegrations.Jitsi;
using FlowPilot.Application.ExternalIntegrations.Jitsi.Models.Response;
using FlowPilot.Application.Nexus.Identity.Users;
using FlowPilot.Application.Nexus.MultiTenant;
using FlowPilot.Application.Setting;
using FlowPilot.Application.Setting.Models;
using FlowPilot.Domain.Enums.Appointment;
using FlowPilot.Infrastructure.Auth;
using FlowPilot.Infrastructure.ExternalIntegrations.Jitsi;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Infrastructure.SystemConstants;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace FlowPilot.Infrastructure.Orbit.Appointment.AppointmentParticipant;
public class ParticipantAppointmentBookingService : IParticipantAppointmentBookingService
{
    private readonly ApplicationDbContext _applicationDbContext;
    private readonly IUserService _userService;
    private readonly IDateTimeService _dateTimeOffsetService;
    private readonly IMailService _mailService;
    private readonly ISettingService _settingService;
    private readonly IJobService _jobService;
    private readonly IAppointmentRequestService _appointmentService;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserInitializer _currentUserInitializer;
    private readonly IJitsiService _jitsiService;
    private readonly JitsiSettings _jitsiSettings;

    public ParticipantAppointmentBookingService(
        IDateTimeService DateTimeService,
        ApplicationDbContext applicationDbContext,
        IUserService userService,
        IMailService mailService,
        ISettingService settingService,
        IJobService jobService,
        IAppointmentRequestService appointmentService,
        ITenantService tenantService,
        ICurrentUserInitializer currentUserInitializer,
        IJitsiService jitsiService,
        IOptions<JitsiSettings> jitsiSettings)
    {
        _applicationDbContext = applicationDbContext;
        _userService = userService;
        _dateTimeOffsetService = DateTimeService;
        _mailService = mailService;
        _settingService = settingService;
        _jobService = jobService;
        _appointmentService = appointmentService;
        _tenantService = tenantService;
        _currentUserInitializer = currentUserInitializer;
        _jitsiService = jitsiService;
        _jitsiSettings = jitsiSettings.Value;
    }

    private async Task SetCurrentTenant(int tenantId)
    {
        var tenantDetails = await _tenantService.GetByIdAsync(tenantId, new CancellationToken());
        _currentUserInitializer.SetCurrentTenant(tenantDetails.Id, tenantDetails.UniqueId);
    }

    public async Task<ViewParticipantAppointmentRequestResponse> ViewParticipantAppointmentDetailAsync(GetParticipantAppointmentDetailRequest request)
    {
        var appointment = await _applicationDbContext.TempAppointments.Include(x => x.TempAppointmentParticipants).Include(x => x.TempAppointmentAvailabilityWindows)
            .IgnoreQueryFilters().FirstOrDefaultAsync(x => x.IsDeleted == false && x.TempAppointmentParticipants.Any(x => x.UrlIdentifier == request.UrlIdentifier && x.IsDeleted == false));
        _ = appointment ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "appointment participant"));
        await SetCurrentTenant(appointment.TenantId);

        if (appointment.AppointmentStatus != AppointmentStatus.Proposing)
        {
            throw new BadRequestException($"This appointment cannot be accessed.The link has already been {appointment.AppointmentStatus}.");
        }

        var approvedAppointments = await _applicationDbContext.TempAppointmentParticipants
            .Where(x => x.FKTempAppointmentsPKId == appointment.Id && x.ApproveForDate.HasValue && x.AppointmentParticipantResponseStatus == AppointmentParticipantResponseStatus.Accepted).ToListAsync();

        var appointmentParticipantDetail = appointment.TempAppointmentParticipants.First(x => x.UrlIdentifier == request.UrlIdentifier);
        var hostDetails = appointment.TempAppointmentParticipants.Single(x => x.AppointmentParticipantRole == AppointmentParticipantRole.Host);
        var userIds = new List<string> { appointmentParticipantDetail.FKApplicationUserPKId, appointment.TempAppointmentParticipants.Single(x => x.AppointmentParticipantRole == AppointmentParticipantRole.Host).FKApplicationUserPKId };
        var userDetails = await _userService.GetUserDetails(userIds.ToArray(), true);

        var result = new ViewParticipantAppointmentRequestResponse
        {
            Title = appointment.Title,
            Description = appointment.Description,
            DurationMinutes = appointment.DurationMinutes,
            LocationType = appointment.LocationType,
            AppointmentStatus = appointment.AppointmentStatus,
            MultipleParticipantPerSlot = appointment.MultipleParticipantPerSlot,
            ApprovalRule = appointment.ApprovalRule,
            HostDetails = new ViewParticipantAppointmentParticipantResponse
            {
                ParticipantDetail = userDetails.First(u => u.Id.ToString() == appointment.TempAppointmentParticipants.Single(x => x.AppointmentParticipantRole == AppointmentParticipantRole.Host).FKApplicationUserPKId),
                AppointmentParticipantRole = AppointmentParticipantRole.Host,
                AppointmentParticipantResponseStatus = AppointmentParticipantResponseStatus.Accepted,
                TimeZone = hostDetails.TimeZone
            },
            ParticipantDetails = new ViewParticipantAppointmentParticipantResponse
            {
                ParticipantDetail = userDetails.First(u => u.Id.ToString() == appointmentParticipantDetail.FKApplicationUserPKId),
                AppointmentParticipantRole = appointmentParticipantDetail.AppointmentParticipantRole,
                AppointmentParticipantResponseStatus = appointmentParticipantDetail.AppointmentParticipantResponseStatus,
                TimeZone = appointmentParticipantDetail.TimeZone,
            },
            AvailabilityWindow = appointment.TempAppointmentAvailabilityWindows.Select(w => new ViewParticipantAppointmentAvailabilityWindowResponse
            {
                OnDate = w.OnDate,
                TimeFrom = w.TimeFrom,
                TimeTo = w.TimeTo
            }).ToList(),
            BookedWindow = approvedAppointments.GroupBy(x => new { ApproveForDate = x.ApproveForDate!.Value, x.ApproveTimeFrom, x.ApproveTimeTo }).Select(g => new ViewParticipantAppointmentAvailabilityBookedWindowResponse
            {
                ApproveForDate = g.Key.ApproveForDate,
                ApproveTimeFrom = g.Key.ApproveTimeFrom!.Value,
                ApproveTimeTo = g.Key.ApproveTimeTo!.Value,
                BookedCount = g.Count(),
            }).ToList()
        };

        return result;
    }

    public async Task<ParticipantApprovalResponse> ParticipantApprovalAsync(ParticipantApprovalRequest request)
    {
        var currentDateTimeOffset = _dateTimeOffsetService.UtcNow;

        if (_dateTimeOffsetService.ConvertToUTCDate(request.SelectedTimeFrom).Date < currentDateTimeOffset.Date)
        {
            throw new BadRequestException(string.Format(ErrorMessages.SelectPastDate));
        }

        if (_dateTimeOffsetService.ConvertToUTCDate(request.SelectedTimeFrom) < currentDateTimeOffset)
        {
            throw new BadRequestException(string.Format(ErrorMessages.SelectPastTime));
        }

        var appointment = await _applicationDbContext.TempAppointments.Include(x => x.TempAppointmentParticipants).Include(x => x.TempAppointmentAvailabilityWindows)
          .IgnoreQueryFilters().FirstOrDefaultAsync(x => x.IsDeleted == false && x.TempAppointmentParticipants.Any(x => x.UrlIdentifier == request.UrlIdentifier && x.IsDeleted == false));
        _ = appointment ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "item"));
        await SetCurrentTenant(appointment.TenantId);

        var tempAppointmentParticipants = appointment.TempAppointmentParticipants.First(x => x.UrlIdentifier == request.UrlIdentifier);

        if (tempAppointmentParticipants.AppointmentParticipantResponseStatus != AppointmentParticipantResponseStatus.Pending)
        {
            throw new BadRequestException(ErrorMessages.ParticipantAlreadyAccepted);
        }

        var slotDateTimeOffset = appointment.TempAppointmentAvailabilityWindows.SingleOrDefault(x => x.TimeFrom.Date == _dateTimeOffsetService.ConvertToUTCDate(request.SelectedTimeFrom).Date);

        if (slotDateTimeOffset == null)
        {
            throw new BadRequestException("No available slots found for the selected date.");
        }

        var selectedTimeOfDay = _dateTimeOffsetService.ConvertToUTCDate(request.SelectedTimeFrom).TimeOfDay;
        var fromTimeOfDay = slotDateTimeOffset.TimeFrom.TimeOfDay;
        var toTimeOfDay = slotDateTimeOffset.TimeTo.TimeOfDay;

        if (selectedTimeOfDay < fromTimeOfDay || selectedTimeOfDay > toTimeOfDay)
        {
            throw new BadRequestException("Selected time is outside the available slot range.");
        }

        var approvedAppointments = await _applicationDbContext.TempAppointmentParticipants
            .Where(x => x.FKTempAppointmentsPKId == appointment.Id && x.ApproveForDate.HasValue && x.AppointmentParticipantResponseStatus == AppointmentParticipantResponseStatus.Accepted
            && x.IsDeleted == false).GroupBy(x => new { x.ApproveForDate, x.ApproveTimeFrom, x.ApproveTimeTo }).Select(g => new ViewParticipantAppointmentAvailabilityBookedWindowResponse
            {
                ApproveForDate = g.Key.ApproveForDate!.Value,
                ApproveTimeFrom = g.Key.ApproveTimeFrom!.Value,
                ApproveTimeTo = g.Key.ApproveTimeTo!.Value,
                BookedCount = g.Count(),
            }).ToListAsync();

        switch (appointment.ApprovalRule)
        {

            case AppointmentApprovalRule.CreateAppointmentForTheParticipantOnceApprovedByThatParticipantOnePerSlot:
                if (approvedAppointments.Any(x => x.ApproveTimeFrom == _dateTimeOffsetService.ConvertToUTCDate(request.SelectedTimeFrom)))
                {
                    throw new BadRequestException(ErrorMessages.AppointmentSlotAlreadyBooked);
                }
                break;

            case AppointmentApprovalRule.CreateAppointmentForTheParticipantOnceApprovedByThatParticipantMultiplePerSlot:
                var selectedSlot = _dateTimeOffsetService.ConvertToUTCDate(request.SelectedTimeFrom);

                if (approvedAppointments.Any(x => x.ApproveTimeFrom == selectedSlot
                                                  && x.BookedCount == appointment.MultipleParticipantPerSlot))
                {
                    throw new BadRequestException(ErrorMessages.AppointmentSlotAlreadyBooked);
                }

                break;
        }

        tempAppointmentParticipants.AppointmentParticipantResponseStatus = AppointmentParticipantResponseStatus.Accepted;
        tempAppointmentParticipants.ApproveForDate = _dateTimeOffsetService.ConvertToUTCDate(request.SelectedTimeFrom);
        tempAppointmentParticipants.ApproveTimeFrom = _dateTimeOffsetService.ConvertToUTCDate(request.SelectedTimeFrom);
        tempAppointmentParticipants.ApproveTimeTo = _dateTimeOffsetService.ConvertToUTCDate(request.SelectedTimeTo);

        _applicationDbContext.TempAppointmentParticipants.Update(tempAppointmentParticipants);
        await _applicationDbContext.SaveChangesAsync();


        await _appointmentService.ExecuteAppointmentApprovalRule(appointment.Id);

        await _mailService.SendEmailOnAppointmentApproval(appointment.Id, tempAppointmentParticipants.Id);

        await ScheduleParticipantApprovedReminders(appointment.Id, tempAppointmentParticipants.Id);

        return new ParticipantApprovalResponse
        {
            SelectedDate = request.SelectedDate,
            SelectedTimeFrom = request.SelectedTimeFrom,
            SelectedTimeTo = request.SelectedTimeTo,
        };
    }

    public async Task<string> ParticipantCancelAsync(ParticipantCancelRequest request)
    {
        var appointment = await _applicationDbContext.TempAppointments.Include(x => x.TempAppointmentParticipants).Include(x => x.TempAppointmentAvailabilityWindows)
         .IgnoreQueryFilters().FirstOrDefaultAsync(x => x.IsDeleted == false && x.TempAppointmentParticipants.Any(x => x.UrlIdentifier == request.UrlIdentifier && x.IsDeleted == false));
        _ = appointment ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "item"));
        await SetCurrentTenant(appointment.TenantId);

        var tempAppointmentParticipants = appointment.TempAppointmentParticipants.First(x => x.UrlIdentifier == request.UrlIdentifier);

        if (tempAppointmentParticipants.AppointmentParticipantResponseStatus != AppointmentParticipantResponseStatus.Pending)
        {
            throw new BadRequestException(ErrorMessages.ParticipantAlreadyAccepted);
        }

        tempAppointmentParticipants.AppointmentParticipantResponseStatus = AppointmentParticipantResponseStatus.Declined;
        tempAppointmentParticipants.DeclinedReason = request.Reason;
        tempAppointmentParticipants.DeclinedAt = _dateTimeOffsetService.UtcNow;

        _applicationDbContext.TempAppointmentParticipants.Update(tempAppointmentParticipants);
        await _applicationDbContext.SaveChangesAsync();

        await _mailService.SendEmailOnAppointmentDecline(appointment.Id, tempAppointmentParticipants.Id);

        return string.Format(SuccessMessages.ParticipantCancelSuccessfully);

    }

    private async Task ScheduleParticipantApprovedReminders(DefaultIdType tempAppointmentId, DefaultIdType tempAppointmentParticipantId)
    {
        var appointment = await _applicationDbContext.TempAppointments
            .Include(x => x.TempAppointmentParticipants)
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.IsDeleted == false && x.Id == tempAppointmentId);

        _ = appointment ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "item"));

        var approvedParticipant = appointment.TempAppointmentParticipants.Single(x => x.Id == tempAppointmentParticipantId);

        if (approvedParticipant.AppointmentParticipantResponseStatus != AppointmentParticipantResponseStatus.Accepted)
            return;

        var appointmentSetting = await _settingService.GetSettingByCodeAsync<ApprovedAppointmentSetting>(Domain.Enums.SettingTypes.ApprovedAppointment);

        var approvedDateTimeOffset = approvedParticipant.ApproveTimeFrom.Value.Date
                               + approvedParticipant.ApproveTimeFrom.Value.TimeOfDay;

        var now = _dateTimeOffsetService.UtcNow;
        var reminders = new HashSet<DateTimeOffset>();

        var dayBeforeReminder = approvedDateTimeOffset.AddDays(-appointmentSetting.ReminderBeforeDays);
        if (dayBeforeReminder > now)
            reminders.Add(dayBeforeReminder);

        var hourBeforeReminder = approvedDateTimeOffset.AddMinutes(-appointmentSetting.LastReminderBeforeMinute);
        if (hourBeforeReminder > now)
            reminders.Add(hourBeforeReminder);

        foreach (var reminderTime in reminders.OrderBy(x => x))
        {
            var delay = reminderTime - now;
            if (delay <= TimeSpan.Zero) continue;

            _jobService.Schedule(
                () => _mailService.SendApprovedAppointmentReminder(tempAppointmentId, tempAppointmentParticipantId),
                delay
            );
        }
    }

    public async Task<StartMeetingResponse> StartMeetingAsync(string meetingUrlIdentifier)
    {
        var appointment = await _applicationDbContext.TempAppointments.Include(x => x.TempAppointmentParticipants).Include(x => x.TempAppointmentAvailabilityWindows)
        .IgnoreQueryFilters().FirstOrDefaultAsync(x => x.IsDeleted == false && x.TempAppointmentParticipants.Any(x => x.MeetingUrlIdentifier == meetingUrlIdentifier && x.IsDeleted == false));
        _ = appointment ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "item"));

        await SetCurrentTenant(appointment.TenantId);

        var currentParticipant = appointment.TempAppointmentParticipants.First(x => x.MeetingUrlIdentifier == meetingUrlIdentifier);
        var hostParticipant = appointment.TempAppointmentParticipants.Single(x => x.AppointmentParticipantRole == AppointmentParticipantRole.Host);

        var userIds = appointment.TempAppointmentParticipants.Select(x => x.FKApplicationUserPKId).ToList();
        var userDetails = await _userService.GetUserDetails(userIds.ToArray(), true);

        var hostParticipantUserDetails = userDetails.First(u => u.Id.ToString() == hostParticipant.FKApplicationUserPKId);
        var currentParticipantUserDetails = userDetails.First(u => u.Id.ToString() == currentParticipant.FKApplicationUserPKId);

        var startMeetingResponse = new StartMeetingResponse
        {
            Title = appointment.Title,
            Description = appointment.Description,
            DurationMinutes = appointment.DurationMinutes,
            LocationType = AppointmentLocationType.Jitsi,
            AppointmentStatus = appointment.AppointmentStatus,
            HostDetails = new ViewParticipantAppointmentParticipantResponse
            {
                ParticipantDetail = hostParticipantUserDetails,
                AppointmentParticipantRole = AppointmentParticipantRole.Host,
                AppointmentParticipantResponseStatus = AppointmentParticipantResponseStatus.Accepted,
                TimeZone = hostParticipant.TimeZone,
                MeetingParticipantPresenceStatus = hostParticipant.MeetingParticipantPresenceStatus,
            },
            CurrentParticipantDetail = appointment.TempAppointmentParticipants.Where(x => x.FKApplicationUserPKId == currentParticipant.FKApplicationUserPKId)
                .Select(x => new ViewParticipantAppointmentParticipantResponse
                {
                    ParticipantDetail = userDetails.Single(y => y.Id == new Guid(x.FKApplicationUserPKId)),
                    AppointmentParticipantRole = x.AppointmentParticipantRole,
                    AppointmentParticipantResponseStatus = x.AppointmentParticipantResponseStatus,
                    TimeZone = x.TimeZone,
                    MeetingParticipantPresenceStatus = x.MeetingParticipantPresenceStatus
                }).Single(),
            ParticipantDetails = appointment.TempAppointmentParticipants.Where(x => x.AppointmentParticipantRole
            != AppointmentParticipantRole.Host && x.FKApplicationUserPKId != currentParticipant.FKApplicationUserPKId)
                .Select(x => new ViewParticipantAppointmentParticipantResponse
                {
                    ParticipantDetail = userDetails.Single(y => y.Id == new Guid(x.FKApplicationUserPKId)),
                    AppointmentParticipantRole = x.AppointmentParticipantRole,
                    AppointmentParticipantResponseStatus = x.AppointmentParticipantResponseStatus,
                    TimeZone = x.TimeZone,
                    MeetingParticipantPresenceStatus= x.MeetingParticipantPresenceStatus
                }).ToList(),
        };

        if (appointment.LocationType == AppointmentLocationType.Jitsi)
        {
            var appointmentParticipant = appointment.TempAppointmentParticipants.Single(x => x.MeetingUrlIdentifier == meetingUrlIdentifier);
            string roomName = appointment.Title + "-" + appointment.Id;
            string token = _jitsiService.GenerateToken(roomName, appointmentParticipant.AppointmentParticipantRole == AppointmentParticipantRole.Host, currentParticipantUserDetails);

            startMeetingResponse.JitsiRoomSettingResponse = new JitsiRoomSettingResponse
            {
                Domain = _jitsiSettings.Host,
                RoomName = appointment.Id.ToString(),
                JWtToken = token,
                JitsiConfigOverwrite = new JitsiConfigOverwriteResponse(),
                jitsiInterfaceConfigOverwrite = new JitsiInterfaceConfigOverwriteResponse()
                {
                    DISABLE_JOIN_LEAVE_NOTIFICATIONS = false,
                }
            };
        }

        return startMeetingResponse;
    }

    public async Task<string> MeetingParticipantPresenceAsync(MeetingParticipantPresenceRequest request)
    {

        var appointmentParticipant = await _applicationDbContext.TempAppointmentParticipants.IgnoreQueryFilters().SingleOrDefaultAsync(x => x.MeetingUrlIdentifier == request.MeetingUrlIdentifier && x.IsDeleted == false);
        _ = appointmentParticipant ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "item"));
        await SetCurrentTenant(appointmentParticipant.TenantId);

        appointmentParticipant.MeetingParticipantPresenceStatus = request.Status;
        _applicationDbContext.TempAppointmentParticipants.Update(appointmentParticipant);

        await _applicationDbContext.SaveChangesAsync();
        return SuccessMessages.RecordUpdatedSuccessfully;
    }

}
