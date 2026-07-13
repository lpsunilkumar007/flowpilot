using FlowPilot.Application.Common.Caching;
using FlowPilot.Application.Common.FileStorage;
using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Application.Common.Mailing;
using FlowPilot.Application.Nexus.Identity.Users;
using FlowPilot.Application.Nexus.LookUp;
using FlowPilot.Application.Nexus.MultiTenant;
using FlowPilot.Infrastructure.Auth;
using FlowPilot.Infrastructure.Logging;
using FlowPilot.Infrastructure.Nexus.Identity.DbModels;
using FlowPilot.Infrastructure.Persistence.Context.Nexus;
using FlowPilot.Infrastructure.Persistence.Initialization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace FlowPilot.Infrastructure.Nexus.Identity;
internal partial class UserService : IUserService
{
    private readonly ICacheService _cache;
    private readonly ICacheKeyService _cacheKeys;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SecuritySettings _securitySettings;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly NexusDbContext _nexusDbContext;
    private readonly ICurrentUser _currentUser;
    private readonly ITenantService _tenantService;
    private readonly IMailService _mailService;
    private readonly IJobService _jobService;
    private readonly IFileStorageService _fileStorage;
    private readonly IDatabaseInitializer _databaseInitializer;
    private readonly INexusLookUpService _nexusLookUpService;
    private readonly INotificationSender _notificationSender;
    private readonly LoggerSettings _loggerSettings;

    public UserService(
       SignInManager<ApplicationUser> signInManager,
       ICacheService cache,
       ICacheKeyService cacheKeys,
       UserManager<ApplicationUser> userManager,
       RoleManager<ApplicationRole> roleManager,
       NexusDbContext nexusDbContext,
       ITenantService tenantService,
       ICurrentUser currentUser,
       IOptions<SecuritySettings> securitySettings,
       IMailService mailService,
       IJobService jobService,
       IFileStorageService fileStorage,
       INexusLookUpService nexusLookUpService,
       IDatabaseInitializer databaseInitializer,
       INotificationSender notificationSender,
       IOptions<LoggerSettings> loggerSettings

        )
    {
        _signInManager = signInManager;
        _cache = cache;
        _cacheKeys = cacheKeys;
        _userManager = userManager;
        _roleManager = roleManager;
        _nexusDbContext = nexusDbContext;
        _tenantService = tenantService;
        _currentUser = currentUser;
        _securitySettings = securitySettings.Value;
        _mailService = mailService;
        _jobService = jobService;
        _fileStorage = fileStorage;
        _nexusLookUpService = nexusLookUpService;
        _databaseInitializer = databaseInitializer;
        _notificationSender = notificationSender;
        _loggerSettings = loggerSettings.Value;
    }

    public async Task<IdentityResult> ValidateUserAndPasswordAsync(ApplicationUser user, string password)
    {
        var userValidationResult = await _userManager.UserValidators
            .First()
            .ValidateAsync(_userManager, user);

        if (!userValidationResult.Succeeded)
        {
            return userValidationResult; // Return user validation errors
        }

        var passwordValidationResult = await _userManager.PasswordValidators
            .First()
            .ValidateAsync(_userManager, user, password);

        if (!passwordValidationResult.Succeeded)
        {
            return passwordValidationResult; // Return password validation errors
        }

        return IdentityResult.Success; // Both validations succeeded
    }

    public Task<int> GetCountAsync(CancellationToken cancellationToken) =>
       _userManager.Users.AsNoTracking().CountAsync(x => x.FKTenantId == _currentUser.GetTenant(), cancellationToken);
}
