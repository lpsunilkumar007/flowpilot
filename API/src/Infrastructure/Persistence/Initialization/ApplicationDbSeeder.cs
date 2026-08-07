using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Extensions;
using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Application.Nexus.Identity.Users;
using FlowPilot.Domain.Enums;
using FlowPilot.Domain.Enums.CRM;
using FlowPilot.Domain.LookUp;
using FlowPilot.Infrastructure.Auth;
using FlowPilot.Infrastructure.Nexus.Identity.DbModels;
using FlowPilot.Infrastructure.Nexus.MultiTenant.DbModels;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Infrastructure.Persistence.Context.Nexus;
using FlowPilot.Shared.Authorization;
using FlowPilot.Shared.Nexus;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Persistence.Initialization;

internal class ApplicationDbSeeder
{
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;

    private readonly ISerializerService _serializer;
    private readonly NexusDbContext _nexusDbContext;
    private readonly IUserService _userService;
    private readonly ICurrentUserInitializer _currentUserInitializer;

    public ApplicationDbSeeder(RoleManager<ApplicationRole> roleManager, NexusDbContext nexusDbContext, UserManager<ApplicationUser> userManager, ISerializerService serializer, IUserService userService, ICurrentUserInitializer currentUserInitializer)
    {
        _roleManager = roleManager;
        _userManager = userManager;

        _serializer = serializer;
        _nexusDbContext = nexusDbContext;
        _userService = userService;
        _currentUserInitializer = currentUserInitializer;
    }

    public async Task SeedDatabaseAsync(ApplicationDbContext dbContext, NexusDbContext nexusDbContext, Tenants currentTenant, CancellationToken cancellationToken)
    {
        //_currentUserInitializer.SetCurrentUserId(userId);
        _currentUserInitializer.SetCurrentTenant(currentTenant.Id, currentTenant.UniqueId);

        await _userService.AssignDefaultRoleToNewTenantAsync(currentTenant.Id, currentTenant.UniqueId, cancellationToken);

        await SeedAdminUserAsync(nexusDbContext, currentTenant);
        //await _seederRunner.RunSeedersAsync(cancellationToken);
        await SeedLookUps(dbContext, currentTenant, cancellationToken);
        await SeedLookTypeUps(dbContext, currentTenant, cancellationToken);
        await SeedSettings(dbContext, currentTenant, cancellationToken);
    }

    private async Task SeedAdminUserAsync(NexusDbContext dbContext, Tenants tenant)
    {
        if (tenant.UniqueId != NexusConstants.Root.TenantUniqueId)
        {
            return;
        }

        var defaultadsds = dbContext.NexusLookUpCodes.Include(x => x.NexusLookUpCodeValues)
            .Where(x => x.LookUpCodeType == Domain.Enums.Nexus.NexusLookUpCodeTypes.UserTimeZone).First();

        if (await _userManager.Users.FirstOrDefaultAsync(u => u.Id == NexusConstants.Root.UserId)
            is not ApplicationUser adminUser)
        {
            string adminUserName = $"{tenant.Name.Trim()}.{SystemRoles.Admin}".ToLowerInvariant();
            adminUser = new ApplicationUser
            {
                Id = NexusConstants.Root.UserId,
                FirstName = tenant.Name.Trim().ToLowerInvariant(),
                LastName = SystemRoles.Admin,
                Email = NexusConstants.Root.EmailAddress,
                UserName = adminUserName,
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                NormalizedEmail = NexusConstants.Root.EmailAddress.ToUpperInvariant(),
                NormalizedUserName = adminUserName.ToUpperInvariant(),
                IsActive = true,
                FKTenantId = tenant.Id,
                TimeZone = defaultadsds.NexusLookUpCodeValues.First().LookUpValue,
                UserRegistrationType = Domain.Enums.Nexus.UserRegistrationType.SeedUser,
                UserTwoFactorAuthenticationType = Domain.Enums.Nexus.UserTwoFactorAuthenticationTypes.None,
                TwoFactorEnabled = false
            };


            var password = new PasswordHasher<ApplicationUser>();
            adminUser.PasswordHash = password.HashPassword(adminUser, NexusConstants.Root.DefaultPassword);
            await _userManager.CreateAsync(adminUser);

        }

        // Assign role to user
        if (!await _userManager.IsInRoleAsync(adminUser, SystemRoles.FormatTenantRoleName(SystemRoles.Admin, tenant.Id)))
        {

            await _userManager.AddToRoleAsync(adminUser, SystemRoles.FormatTenantRoleName(SystemRoles.Admin, tenant.Id));
        }
    }

    private async Task SeedLookUps(ApplicationDbContext dbContext, Tenants tenant, CancellationToken cancellationToken)
    {
        foreach (LookUpCodeTypes type in Enum.GetValues(typeof(LookUpCodeTypes)))
        {
            if (!await dbContext.LookUpCodes.AnyAsync(x => x.LookUpCodeType == type))
            {

                await dbContext.LookUpCodes.AddAsync(new Domain.LookUp.LookUpCodes
                {
                    LookUpCodeType = type,
                    Description = type.GetDescription()
                });
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task SeedLookTypeUps(ApplicationDbContext dbContext, Tenants tenant, CancellationToken cancellationToken)
    {
        await SeedLeadStatusLookUpValuesAsync(dbContext, tenant, cancellationToken);
        await SeedLeadSourceLookUpValuesAsync(dbContext, tenant, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedLeadStatusLookUpValuesAsync(ApplicationDbContext dbContext, Tenants tenant, CancellationToken cancellationToken)
    {
        var status = await dbContext.LookUpCodes.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.LookUpCodeType == LookUpCodeTypes.LeadStatus && x.TenantId == tenant.Id, cancellationToken);
        if (status is null)
            return;

        foreach (LeadStatus type in Enum.GetValues(typeof(LeadStatus)))
        {
            bool exists = await dbContext.LookUpCodeValues.IgnoreQueryFilters().Include(m => m.LookUpCode).AnyAsync(x => x.LookUpCode.LookUpCodeType == LookUpCodeTypes.LeadStatus && x.TenantId == tenant.Id && x.LookUpValue == type.ToString(), cancellationToken);

            if (!exists)
            {
                await dbContext.LookUpCodeValues.AddAsync(new LookUpCodeValues
                {
                    LookUpValue = type.ToString(),
                    DisplayOrder = (int)type,
                    FKLookUpCodePKId = status.Id,
                    IsActive = true,
                    TenantId = tenant.Id
                });
            }
        }
    }

    private static async Task SeedLeadSourceLookUpValuesAsync(ApplicationDbContext dbContext, Tenants tenant, CancellationToken cancellationToken)
    {
        var leadSource = await dbContext.LookUpCodes.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.LookUpCodeType == LookUpCodeTypes.LeadSource && x.TenantId == tenant.Id, cancellationToken);
        if (leadSource is null)
            return;

        foreach (LeadSource type in Enum.GetValues(typeof(LeadSource)))
        {
            string lookUpValue = type.GetDescription();
            bool exists = await dbContext.LookUpCodeValues.IgnoreQueryFilters().Include(m => m.LookUpCode).AnyAsync(x => x.LookUpCode.LookUpCodeType == LookUpCodeTypes.LeadSource && x.TenantId == tenant.Id && x.LookUpValue == lookUpValue, cancellationToken);

            if (!exists)
            {
                await dbContext.LookUpCodeValues.AddAsync(new LookUpCodeValues
                {
                    LookUpValue = lookUpValue,
                    DisplayOrder = (int)type,
                    FKLookUpCodePKId = leadSource.Id,
                    IsActive = true,
                    TenantId = tenant.Id
                });
            }
        }
    }

    private async Task SeedSettings(ApplicationDbContext dbContext, Tenants tenant, CancellationToken cancellationToken)
    {
        foreach (SettingTypes type in Enum.GetValues(typeof(SettingTypes)))
        {
            if (!await dbContext.Settings.AnyAsync(x => x.SettingType == type))
            {
                switch (type)
                {
                    //case SettingTypes.Appointment:
                    //    await dbContext.Settings.AddAsync(new Domain.Setting.Settings
                    //    {
                    //        OriginalValue = _serializer.Serialize(new AppointmentSettingModels()),
                    //        SettingValues = _serializer.Serialize(new AppointmentSettingModels()),
                    //        Description = type.GetDescription(),
                    //        SettingType = type
                    //    });
                    //    break;
                    //case SettingTypes.ApprovedAppointment:
                    //    await dbContext.Settings.AddAsync(new Domain.Setting.Settings
                    //    {
                    //        OriginalValue = _serializer.Serialize(new ApprovedAppointmentSetting()),
                    //        SettingValues = _serializer.Serialize(new ApprovedAppointmentSetting()),
                    //        Description = type.GetDescription(),
                    //        SettingType = type
                    //    });
                    //    break;
                    case SettingTypes.Appointment:
                    case SettingTypes.ApprovedAppointment:
                        break;
                    case SettingTypes.GoogleMapKey:
                        await dbContext.Settings.AddAsync(new Domain.Setting.Settings
                        {
                            OriginalValue = _serializer.Serialize("AIzaSyD8gZW_iUpwVDVEYrypMRRRbmj9AggzCYo"),
                            SettingValues = _serializer.Serialize("AIzaSyD8gZW_iUpwVDVEYrypMRRRbmj9AggzCYo"),
                            Description = type.GetDescription(),
                            SettingType = type,

                        });
                        break;
                    default:
                        throw new CustomNotImplementedException($"{type.ToString()} not setup");
                }
            }
        }

        await dbContext.SaveChangesAsync();
    }
}