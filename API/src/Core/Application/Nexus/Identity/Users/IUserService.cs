using FlowPilot.Application.Common.Models.Response;
using FlowPilot.Application.Nexus.Identity.Users.Models;
using FlowPilot.Application.Nexus.Identity.Users.Models.Request;
using FlowPilot.Application.Nexus.Identity.Users.Models.Response;
using FlowPilot.Domain.Enums.Nexus;

namespace FlowPilot.Application.Nexus.Identity.Users;
public interface IUserService : ITransientService
{
    //Task<PaginationResponse<UserDetailsDto>> SearchAsync(UserListFilter filter, CancellationToken cancellationToken);

    //Task<bool> ExistsWithNameAsync(string name);
    //Task<bool> ExistsWithEmailAsync(string email, string? exceptId = null);
    //Task<bool> ExistsWithPhoneNumberAsync(string phoneNumber, string? exceptId = null);

    Task<List<ViewUserDetailsResponse>> GetListAsync(CancellationToken cancellationToken);

    Task<int> GetCountAsync(CancellationToken cancellationToken);

    Task<ViewUserDetailsResponse> GetAsync(string userId, CancellationToken cancellationToken);

    Task<ViewUserTwoFactorAuthenticationDetailsResponse> GetTwoFactorAuthenticationDetailsAsync(string userId);

    Task<List<UserRoleResponse>> GetRolesAsync(string userId, CancellationToken cancellationToken);
    Task<string> AssignRolesAsync(string userId, UserRolesRequest request, CancellationToken cancellationToken);

    Task<List<string>> GetPermissionsAsync(string userId, CancellationToken cancellationToken);

    Task<bool> HasPermissionAsync(string userId, string permission, CancellationToken cancellationToken = default);

    Task<bool> HasPermissionAsync(string userId, string action, string resource, CancellationToken cancellationToken);

    Task<bool> ResetUserPermissionAsync(string userId, CancellationToken cancellationToken, bool refereshAll);

    //Task InvalidatePermissionCacheAsync(string userId, CancellationToken cancellationToken);

    Task<string> UpdateUserAsync(UpdateUserDetailsRequest request, CancellationToken cancellationToken);

    //Task<string> GetOrCreateFromPrincipalAsync(ClaimsPrincipal principal);
    Task<CreateUserResponse> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken = default);

    Task<RegisterUserResponse> RegisterUserAsync(RegisterUserRequest request, UserRegistrationType userRegistrationType, RegisterUserSocialMedialRequestDto? registerUserSocialMedialRequestDto = null, CancellationToken cancellationToken = default);

    Task<string> UpdateAsync(UpdateUserRequest request, string userId);

    Task<string> UpdateTwoFactorAuthenticationDetailsAsync(UpdateTwoFactorAuthenticationDetailsRequest request, string userId);

    Task<string> ConfirmEmailAsync(string userId, string code, CancellationToken cancellationToken);
    //Task<string> ConfirmPhoneNumberAsync(string userId, string code);

    Task<string> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default);

    Task<string> ResetPasswordAsync(ResetForgotPasswordRequest request);

    Task<string> ChangePasswordAsync(ChangePasswordRequest request, string userId);

    Task<ViewUserDetailsDto> GetByIdAsync(string userId, CancellationToken cancellationToken);

    Task AssignDefaultRoleToNewTenantAsync(int tenantId, Guid uniqueId, CancellationToken cancellationToken);

    Task<List<ViewUserDetailsResponse>> GetUserDetails(string[] userIds, bool convertImageToBase64 = false);

    Task<List<UserDropDownItemResponse>> GetUsersForDropDownAsync(bool ignoreLoggedInUser);

    Task<List<UserDropDownItemResponse>> GetDirectReportUsersForDropDownAsync(CancellationToken cancellationToken = default);

    Task<List<ViewUserDetailsResponse>> GetTenantUsersListAsync(DefaultIdType id);

    Task<string> ChangePasswordForcefullyAsync(ChangePasswordForcefullyRequest model, string userId);

    Task<AuthenticatorEnableResponse> GenerateAuthenticatorEnableAsync();

    Task<bool> VerifyAuthenticatorCodeAsync(string code);

}
