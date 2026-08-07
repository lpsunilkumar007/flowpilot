using System.Text;
using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.FileStorage;
using FlowPilot.Application.Common.Models.Response;
using FlowPilot.Application.Nexus.Identity.Users.Models;
using FlowPilot.Application.Nexus.Identity.Users.Models.Request;
using FlowPilot.Application.Nexus.Identity.Users.Models.Response;
using FlowPilot.Application.Nexus.MultiTenant.Models.Request;
using FlowPilot.Domain.Enums;
using FlowPilot.Domain.Enums.Nexus;
using FlowPilot.Infrastructure.Nexus.Identity.DbModels;
using FlowPilot.Infrastructure.Nexus.Identity.Extensions;
using FlowPilot.Infrastructure.SystemConstants;
using FlowPilot.Shared.Authorization;
using FlowPilot.Shared.Notifications;
using Mapster;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using OtpNet;

namespace FlowPilot.Infrastructure.Nexus.Identity;

internal partial class UserService
{
    public async Task<RegisterUserResponse> RegisterUserAsync(RegisterUserRequest request, UserRegistrationType userRegistrationType, RegisterUserSocialMedialRequestDto? registerUserSocialMedialRequestDto = null, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(request.TimeZone))
        {
            request.TimeZone = (await _nexusLookUpService.GetLookUpCodeDefaultValueByCode(NexusLookUpCodeTypes.UserTimeZone)).LookUpValue;
        }

        bool emailConfirmed = false;
        if (registerUserSocialMedialRequestDto != null)
        {
            if (!string.IsNullOrEmpty(registerUserSocialMedialRequestDto.FacebookJson))
            {
                userRegistrationType = UserRegistrationType.Facebook;
                emailConfirmed = true;
            }
            else if (!string.IsNullOrEmpty(registerUserSocialMedialRequestDto.GoogleJson))
            {
                userRegistrationType = UserRegistrationType.Google;
                emailConfirmed = true;
            }
        }

        bool isDefaultTwoFactorEnabled = _securitySettings.RequiresTwoFactorAuthentication;

        var user = new ApplicationUser
        {
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            UserName = request.Email,
            PhoneNumber = request.PhoneNumber,
            IsActive = true,
            EmailConfirmed = emailConfirmed,
            TimeZone = request.TimeZone,
            UserRegistrationType = userRegistrationType,
            FacebookJson = registerUserSocialMedialRequestDto == null ? string.Empty : registerUserSocialMedialRequestDto.FacebookJson,
            GoogleJson = registerUserSocialMedialRequestDto == null ? string.Empty : registerUserSocialMedialRequestDto.GoogleJson,
            TwoFactorEnabled = isDefaultTwoFactorEnabled,
            UserTwoFactorAuthenticationType = isDefaultTwoFactorEnabled ? UserTwoFactorAuthenticationTypes.Email : UserTwoFactorAuthenticationTypes.None

        };
        var validateUser = await ValidateUserAndPasswordAsync(user, request.Password);
        if (!validateUser.Succeeded)
        {
            throw new BadRequestException(ErrorMessages.IdentityValidationError, validateUser.GetErrors());
        }

        var createTenantResponse = await _tenantService.CreateAsync(
            new CreateTenantRequest
            {
                UniqueId = Guid.NewGuid(),
                Name = request.FirstName + " " + request.LastName,
                AdminEmail = request.Email,
                IsActive = true,
            }, cancellationToken);

        user.FKTenantId = createTenantResponse.TenantId;

        var result = await _userManager.CreateAsync(user, request.Password);

        await AssignDefaultRoleToNewTenantAsync(createTenantResponse.TenantId, createTenantResponse.UniqueId, cancellationToken);

        await _userManager.AddToRoleAsync(user, SystemRoles.FormatTenantRoleName(SystemRoles.Admin, createTenantResponse.TenantId));

        if (_securitySettings.RequireConfirmedAccount && !string.IsNullOrEmpty(user.Email))
        {
            var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
            _jobService.Enqueue(() => _mailService.EmailRegistrationVerificationEmailAsync(user.Id, code, CancellationToken.None));
        }

        await _databaseInitializer.InitializeApplicationDbForTenantAsync(await _nexusDbContext.Tenants.SingleAsync(x => x.Id == createTenantResponse.TenantId), cancellationToken);

        return new RegisterUserResponse { UserId = user.Id, Message = string.Format(SuccessMessages.UserRegistered, user.UserName, user.Email) };
    }

    public async Task<CreateUserResponse> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken)
    {
        int tenantId = _currentUser.GetTenant();        

        bool isDefaultTwoFactorEnabled = _securitySettings.RequiresTwoFactorAuthentication;

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid().ToString(),
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            UserName = request.Email,
            PhoneNumber = request.PhoneNumber,
            IsActive = true,
            FKTenantId = tenantId,
            TimeZone = request.TimeZone,
            UserRegistrationType = UserRegistrationType.ManageUser,
            UserTwoFactorAuthenticationType = isDefaultTwoFactorEnabled ? UserTwoFactorAuthenticationTypes.Email : UserTwoFactorAuthenticationTypes.None,
            FKReportsToUserId = string.IsNullOrWhiteSpace(request.ReportsToUserId) ? null : request.ReportsToUserId
        };

        await _reportingHierarchyService.EnsureValidReportsToAsync(
            user.Id,
            user.FKReportsToUserId,
            tenantId,
            cancellationToken);

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            throw new BadRequestException(ErrorMessages.IdentityValidationError, result.GetErrors());
        }

        await _userManager.AddToRoleAsync(user, SystemRoles.FormatTenantRoleName(SystemRoles.SalesRepresentative, user.FKTenantId));

        return new CreateUserResponse { Message = string.Format(SuccessMessages.UserCreated, user.UserName), UserId = user.Id };
    }

    public async Task<List<ViewUserDetailsResponse>> GetListAsync(CancellationToken cancellationToken)
    {
        var userlist = new List<ViewUserDetailsResponse>();

        var users = await _userManager.Users
               .AsNoTracking()
               .Where(x => x.FKTenantId == _currentUser.GetTenant())
               .ToListAsync();

        string defaultTimeZone = (await _nexusLookUpService.GetLookUpCodeDefaultValueByCode(Domain.Enums.Nexus.NexusLookUpCodeTypes.UserTimeZone)).LookUpValue;

        foreach (var item in users)
        {
            userlist.Add(new ViewUserDetailsResponse
            {
                Id = new Guid(item.Id),
                UserName = item.UserName,
                FirstName = item.FirstName,
                LastName = item.LastName,
                Email = item.Email,
                IsActive = item.IsActive,
                EmailConfirmed = item.EmailConfirmed,
                PhoneNumber = item.PhoneNumber,
                ImageUrl = item.ImageUrl,
                TimeZone = !string.IsNullOrEmpty(item.TimeZone) ? item.TimeZone : defaultTimeZone,
                ReportsToUserId = item.FKReportsToUserId,
            });
        }

        return userlist.Adapt<List<ViewUserDetailsResponse>>();
    }

    public async Task<List<ViewUserDetailsResponse>> GetUserDetails(string[] userIds, bool convertImageToBase64 = false)
    {
        var userlist = new List<ViewUserDetailsResponse>();

        var users = await _nexusDbContext.Users
               .AsNoTracking()
               .Where(x => userIds.Contains(x.Id))
               .ToListAsync();

        foreach (var item in users)
        {
            string imageBase64 = string.Empty;
            if (convertImageToBase64 && !string.IsNullOrEmpty(item.ImageUrl))
            {
                imageBase64 = _fileStorage.FileToBase64String(item.ImageUrl);
            }

            userlist.Add(new ViewUserDetailsResponse
            {
                Id = new Guid(item.Id),
                UserName = item.UserName,
                FirstName = item.FirstName,
                LastName = item.LastName,
                Email = item.Email,
                IsActive = item.IsActive,
                EmailConfirmed = item.EmailConfirmed,
                PhoneNumber = item.PhoneNumber,
                ImageUrl = imageBase64,
                TimeZone = item.TimeZone,
                ReportsToUserId = item.FKReportsToUserId,
            });
        }

        return userlist.Adapt<List<ViewUserDetailsResponse>>();
    }

    public async Task<ViewUserDetailsResponse> GetAsync(string userId, CancellationToken cancellationToken)
    {
        bool isRootTenant = await HasPermissionAsync(_currentUser.GetUserId().ToString(), SystemAction.View, SystemResource.Tenants, new CancellationToken());
        var query = _userManager.Users
            .AsNoTracking()
            .Where(u => u.Id == userId);// && u.FKTenantId == _currentUser.GetTenant())
                                        //.FirstOrDefaultAsync(cancellationToken);

        if (!isRootTenant)
        {
            query = query.Where(u => u.FKTenantId == _currentUser.GetTenant());
        }

        var user = await query.FirstOrDefaultAsync(cancellationToken);
        _ = user ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "User"));

        var userProfileDetails = user.Adapt<ViewUserDetailsResponse>();
        userProfileDetails.ReportsToUserId = user.FKReportsToUserId;
        if (!string.IsNullOrEmpty(userProfileDetails.ImageUrl))
        {
            userProfileDetails.ImageUrl = _fileStorage.FileToBase64String(userProfileDetails.ImageUrl);
        }

        userProfileDetails.IsTwoFactorAuthenticationEnabled = await _userManager.GetTwoFactorEnabledAsync(user);

        return userProfileDetails;
    }

    public async Task<ViewUserTwoFactorAuthenticationDetailsResponse> GetTwoFactorAuthenticationDetailsAsync(string userId)
    {
        bool isRootTenant = await HasPermissionAsync(_currentUser.GetUserId().ToString(), SystemAction.View, SystemResource.Tenants, new CancellationToken());
        var query = _userManager.Users.AsNoTracking().Where(u => u.Id == userId);

        if (!isRootTenant)
        {
            query = query.Where(u => u.FKTenantId == _currentUser.GetTenant());
        }

        var user = await query.FirstOrDefaultAsync();
        _ = user ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "User"));

        ViewUserTwoFactorAuthenticationDetailsResponse details = new ViewUserTwoFactorAuthenticationDetailsResponse
        {
            IsTwoFactorAuthenticationEnabled = await _userManager.GetTwoFactorEnabledAsync(user),
            UserTwoFactorAuthenticationType = user.UserTwoFactorAuthenticationType
        };

        return details;
    }

    public async Task<List<UserDropDownItemResponse>> GetUsersForDropDownAsync(bool ignoreLoggedInUser)
    {
        var userList = new List<UserDropDownItemResponse>();

        var users = await _userManager.Users
               .AsNoTracking()
               .Where(x => x.FKTenantId == _currentUser.GetTenant())
               .ToListAsync();
        if (ignoreLoggedInUser)
        {
            users = users.Where(x => x.Id != _currentUser.GetUserId().ToString()).ToList();
        }

        foreach (var item in users)
        {
            userList.Add(new UserDropDownItemResponse
            {
                TimeZone = item.TimeZone,
                StrValue = item.Id,
                Text = string.Format("{0} {1}", item.FirstName, item.LastName),
            });
        }

        return userList;
    }

    public async Task<List<UserDropDownItemResponse>> GetDirectReportUsersForDropDownAsync(CancellationToken cancellationToken = default)
    {
        string currentUserId = _currentUser.GetUserId().ToString();

        var users = await _userManager.Users
            .AsNoTracking()
            .Where(x => x.FKTenantId == _currentUser.GetTenant() && x.FKReportsToUserId == currentUserId)
            .OrderBy(x => x.FirstName)
            .ThenBy(x => x.LastName)
            .ToListAsync(cancellationToken);

        return users.Select(item => new UserDropDownItemResponse
        {
            TimeZone = item.TimeZone,
            StrValue = item.Id,
            Text = string.Format("{0} {1}", item.FirstName, item.LastName),
        }).ToList();
    }

    public async Task<ViewUserDetailsDto> GetByIdAsync(string userId, CancellationToken cancellationToken)
    {
        var user = await _userManager.Users
            .AsNoTracking()
            .Where(u => u.Id == userId && u.FKTenantId == _currentUser.GetTenant())
            .FirstOrDefaultAsync(cancellationToken);

        _ = user ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "User"));

        return new ViewUserDetailsDto
        {
            Id = new Guid(user.Id),
            UserName = user.UserName,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email!,
            IsActive = user.IsActive,
            EmailConfirmed = user.EmailConfirmed,
            PhoneNumber = user.PhoneNumber,
            ImageUrl = user.ImageUrl,
            TimeZone = user.TimeZone,
            ReportsToUserId = user.FKReportsToUserId,
        };
    }

    public async Task<string> UpdateUserAsync(UpdateUserDetailsRequest request, CancellationToken cancellationToken)
    {
        ApplicationUser? user;
        bool isRootTenant = await HasPermissionAsync(_currentUser.GetUserId().ToString(), SystemAction.Update, SystemResource.Tenants, new CancellationToken());
        if (isRootTenant)
        {
            user = await _userManager.Users.Where(u => u.Id == request.UserId).FirstOrDefaultAsync(cancellationToken);
        }
        else
        {
            user = await _userManager.Users.Where(u => u.Id == request.UserId && u.FKTenantId == _currentUser.GetTenant()).FirstOrDefaultAsync(cancellationToken);

        }

        _ = user ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "User"));

        //bool isAdmin = await _userManager.IsInRoleAsync(user, SystemRoles.Admin);
        //if (isAdmin)
        //{
        //    throw new ConflictException(_t["Administrators Profile's Status cannot be toggled"]);
        //}

        if (request.UserId != _currentUser.GetUserId().ToString())
        {
            user.IsActive = request.IsActive;
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;

        // user.Email = request.Email;
        user.PhoneNumber = request.PhoneNumber;

        // user.EmailConfirmed = request.EmailConfirmed;

        user.TimeZone = request.TimeZone;

        string? reportsTo = string.IsNullOrWhiteSpace(request.ReportsToUserId) ? null : request.ReportsToUserId;
        await _reportingHierarchyService.EnsureValidReportsToAsync(user.Id, reportsTo, user.FKTenantId, cancellationToken);
        user.FKReportsToUserId = reportsTo;

        await _userManager.UpdateAsync(user);

        return SuccessMessages.UpdateUser;
    }

    public async Task<string> UpdateAsync(UpdateUserRequest request, string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        _ = user ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "User"));

        string currentImage = user.ImageUrl ?? string.Empty;
        if (request.Image != null || request.DeleteCurrentImage)
        {
            user.ImageUrl = await _fileStorage.UploadAsync<ApplicationUser>(request.Image, FileType.Image);
            if (request.DeleteCurrentImage && !string.IsNullOrEmpty(currentImage))
            {
                _fileStorage.Remove(currentImage);
            }
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.PhoneNumber = request.PhoneNumber;
        user.TimeZone = request.TimeZone;
        string? phoneNumber = await _userManager.GetPhoneNumberAsync(user);


        if (request.PhoneNumber != phoneNumber)
        {
            await _userManager.SetPhoneNumberAsync(user, request.PhoneNumber);
        }

        var result = await _userManager.UpdateAsync(user);

        await _signInManager.RefreshSignInAsync(user);
        if (!result.Succeeded)
        {
            throw new BadRequestException(ErrorMessages.UpdateProfileFailed, result.GetErrors());
        }

        await _notificationSender.BroadcastAsync(new Test
        {
            Message = "Request done"
        }, new CancellationToken());

        return SuccessMessages.UpdateProfile;
    }

    public async Task<string> UpdateTwoFactorAuthenticationDetailsAsync(UpdateTwoFactorAuthenticationDetailsRequest request, string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        _ = user ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "User"));

        user.UserTwoFactorAuthenticationType = request.UserTwoFactorAuthenticationType;

        switch (request.UserTwoFactorAuthenticationType)
        {
            case UserTwoFactorAuthenticationTypes.Authenticator:
                {
                    string? key = await _userManager.GetAuthenticatorKeyAsync(user);

                    if (string.IsNullOrEmpty(key))
                    {
                        await _userManager.ResetAuthenticatorKeyAsync(user);
                    }

                    break;
                }

            case UserTwoFactorAuthenticationTypes.Email:
                {
                    await _userManager.ResetAuthenticatorKeyAsync(user);
                    break;
                }

            case UserTwoFactorAuthenticationTypes.None:
            default:
                {
                    await _userManager.ResetAuthenticatorKeyAsync(user);
                    request.IsTwoFactorAuthenticationEnabled = false;
                    break;
                }
        }

        await _userManager.SetTwoFactorEnabledAsync(user, request.IsTwoFactorAuthenticationEnabled);
        var result = await _userManager.UpdateAsync(user);
        return SuccessMessages.UpdateProfile;
    }

    public async Task<List<ViewUserDetailsResponse>> GetTenantUsersListAsync(DefaultIdType id)
    {
        var userlist = new List<ViewUserDetailsResponse>();

        var users = await _userManager.Users
               .AsNoTracking()
               .Where(x => x.FKTenantId == id)
               .ToListAsync();

        string defaultTimeZone = (await _nexusLookUpService.GetLookUpCodeDefaultValueByCode(Domain.Enums.Nexus.NexusLookUpCodeTypes.UserTimeZone)).LookUpValue;

        foreach (var item in users)
        {
            userlist.Add(new ViewUserDetailsResponse
            {
                Id = new Guid(item.Id),
                UserName = item.UserName,
                FirstName = item.FirstName,
                LastName = item.LastName,
                Email = item.Email,
                IsActive = item.IsActive,
                EmailConfirmed = item.EmailConfirmed,
                PhoneNumber = item.PhoneNumber,
                ImageUrl = item.ImageUrl,
                TimeZone = !string.IsNullOrEmpty(item.TimeZone) ? item.TimeZone : defaultTimeZone,
                ReportsToUserId = item.FKReportsToUserId,
            });
        }

        return userlist.Adapt<List<ViewUserDetailsResponse>>();
    }

    public async Task<AuthenticatorEnableResponse> GenerateAuthenticatorEnableAsync()
    {
        string loggedUserId = _currentUser.GetUserId().ToString();
        var loggedUser = await _userManager.FindByIdAsync(loggedUserId);
        string? secretKey = await _userManager.GetAuthenticatorKeyAsync(loggedUser);

        if (string.IsNullOrEmpty(secretKey))
        {
            await _userManager.ResetAuthenticatorKeyAsync(loggedUser);
            secretKey = await _userManager.GetAuthenticatorKeyAsync(loggedUser);
        }
        string qrText = $"otpauth://totp/flowpilot:{loggedUser.Email}?secret={secretKey}&issuer={_loggerSettings.AppName}";

        using var qrGenerator = new QRCoder.QRCodeGenerator();
        var qrData = qrGenerator.CreateQrCode(qrText, QRCoder.QRCodeGenerator.ECCLevel.Q);
        var qrCode = new QRCoder.PngByteQRCode(qrData);
        byte[] qrBytes = qrCode.GetGraphic(20);

        return new AuthenticatorEnableResponse
        {
            SecretKey = secretKey!,
            QrCodeImageUrl = new DownloadFileResponse
            {
                Name = "AuthenticatorQR",
                Extension = "png",
                FileBase64String = Convert.ToBase64String(qrBytes)
            }
        };
    }

    public async Task<bool> VerifyAuthenticatorCodeAsync(string code)
    {
        string userId = _currentUser.GetUserId().ToString();
        var user = await _userManager.FindByIdAsync(userId);
        // using OtpNet to verify the code because _userManager.VerifyTwoFactorTokenAsync does not work as expected for authenticator verification in some cases.
        string? key = await _userManager.GetAuthenticatorKeyAsync(user);
        if (string.IsNullOrEmpty(key))
            throw new BadRequestException(ErrorMessages.AuthenticatorNotConfigured);

        byte[] secretBytes = Base32Encoding.ToBytes(key);
        var totp = new Totp(secretBytes);

        bool isValid = totp.VerifyTotp(code, out long timeStepMatched, new VerificationWindow(0, 0));
        if (isValid)
        {
            await _userManager.SetTwoFactorEnabledAsync(user, true);
        }

        return isValid;
    }

}

public class Test : INotificationMessage
{
    public required string Message { get; set; }
}
