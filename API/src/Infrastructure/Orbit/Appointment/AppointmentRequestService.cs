using FlowPilot.Application.Appointment;
using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Application.Common.Mailing;
using FlowPilot.Application.Nexus.Identity.Users;
using FlowPilot.Application.Setting;
using FlowPilot.Infrastructure.Persistence.Context;

namespace FlowPilot.Infrastructure.Orbit.Appointment;
public partial class AppointmentRequestService : IAppointmentRequestService
{
    private readonly ApplicationDbContext _applicationDbContext;
    private readonly IDateTimeService _DateTimeOffsetService;
    private readonly IUrlService _urlService;
    private readonly ICurrentUser _currentUser;
    private readonly IMailService _mailService;
    private readonly IJobService _jobService;
    private readonly IUserService _userService;
    private readonly ISettingService _settingService;

    public AppointmentRequestService(ApplicationDbContext applicationDbContext, IDateTimeService DateTimeService, IUrlService urlService, ICurrentUser currentUser, IMailService mailService, IJobService jobService, IUserService userService,ISettingService settingService)
    {
        _applicationDbContext = applicationDbContext;
        _DateTimeOffsetService = DateTimeService;
        _urlService = urlService;
        _currentUser = currentUser;
        _mailService = mailService;
        _jobService = jobService;
        _userService = userService;
        _settingService = settingService;
    }  
}
