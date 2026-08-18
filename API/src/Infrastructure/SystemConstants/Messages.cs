namespace FlowPilot.Infrastructure.SystemConstants;
internal class ErrorMessages
{
    public readonly static string AlreadyExists = "{0} already exists";
    public readonly static string ItemNotFound = "{0} not found";
    public readonly static string NotImplementedItem = "{0} not implemented";
    public static readonly string IdentityValidationError = "Validation Errors Occurred.";

    public static readonly string RootTenantRoleCannotBeRemoved = "Cannot Remove Admin Role From Root Tenant Admin.";
    public static readonly string MinimumAdminMessage = "Tenant should have at least 2 Admins.";
    public static readonly string CreateRoleFailed = "Register role failed";
    public static readonly string UpdateRoleFailed = "Register role failed";
    public static readonly string NotAllowedToDeleteRole = "Not allowed to delete {0} Role as it is being used.";
    public static readonly string UpdateProfileFailed = "Update profile failed";
    public static readonly string ChangePasswordFailed = "Change password failed";
    public static readonly string ConfirmEmail = "An error occurred while confirming E-Mail.";
    public static readonly string GenericError = "An Error has occurred!";
    public static readonly string AuthenticationFailed = "Authentication Failed";
    public static readonly string AuthenticationUserNotActive = "User Not Active. Please contact the administrator.";
    public static readonly string AuthenticationEmailNotConfirmed = "E-Mail not confirmed.";
    public static readonly string AuthenticationInvalidRefreshToken = "Invalid Refresh Token.";
    public static readonly string AuthenticationInvalidToken = "Invalid Token.";
    public static readonly string AuthenticationTenantNotActive = "Tenant is not Active. Please contact the Application Administrator.";
    public static readonly string UpdatePermissionsFailed = "Update permissions failed.";
    public static readonly string UpdateCantModifyPermission = "Not allowed to modify Permissions for this Role.";
    public static readonly string CantDeleteRole = "Not allowed to delete {0} Role.";
    public static readonly string NotAuthorized = "You are not authorized to access this resource.";
    public static readonly string ItemAlreadyExists = "Item with the name '{0} already exists.";
    public static readonly string OptionsRequired = "Options are required for this field type.";
    public static readonly string HeadersRequired = "Headers are required for this field type.";
    public static readonly string UpdateSettingsDeserializeCrash = "Invalid setting details";
    public static readonly string AppointmentStatusAlreadyChangedByParticipant = "You have already '{0}' the appointment";

    public static readonly string AppointmentStatusAlreadyCanceled = "You have already canceled this appointment.";
    public static readonly string AppointmentStatusAlreadyRescheduled = "You have already rescheduled this appointment.";
    public static readonly string AppointmentParticipantRequired = "Please select at least one participant.";
    public static readonly string AppointmentAvailability = "Please add at least one valid appointment date and time.";
    public static readonly string GenericMessage = "Something went wrong please try again";
    public static readonly string ParticipantAlreadyAccepted = "Your appointment has already accepted.";
    public static readonly string AppointmentAvailabilityWindows = "Please select at least one availability.";
    public static readonly string AppointmentAvailabilityDate = "Please select date.";
    public static readonly string AppointmentAvailabilityTimeFrom = "Please select time from.";
    public static readonly string AppointmentAvailabilityTimeTo = "Please select time to.";
    public static readonly string AppointmentSlotAlreadyBooked = "This time slot is already booked. Please choose a different time.";

    public static readonly string EmailTemplateSharedAlreadyExists = "Cannot create template. A shared email template named '{0}' already exists.";
    public static readonly string SelectPastDate = "Please select a future date. Past dates are not allowed.";
    public static readonly string SelectPastTime = "Please select a future time. Past times are not allowed.";

    public static readonly string TwoFactorAuthenticationSessionExpired = "2FA session expired. Please login again.";
    public static readonly string TooManyAttempts = "Too many attempts. Please login again.";
    public static readonly string RemainingFewSeconds = "Please try after '{0}' seconds.";
    public static readonly string AuthenticatorNotConfigured = "Authenticator is not configured.";
    public static readonly string InvalidCode = "Invalid security code.";
    public static readonly string InvalidReportsToUser = "Selected manager is invalid for this user.";
    public static readonly string ReportsToCycle = "Cannot set manager because it would create a reporting cycle.";
    public static readonly string AssignedSalesPersonRequired = "Please select an assigned sales person.";
    public static readonly string DuplicateCustomFieldLabels = "Each custom field must have a unique name.";
    public static readonly string CustomFieldLimitExceeded = "Cannot add more than {0} custom fields.";
    public static readonly string CustomFieldLabelAndValueRequired = "Each custom field must have a name and a value.";
    public static readonly string CustomFieldLabelTooLong = "Custom field name cannot be longer than {0} characters.";
    public static readonly string CustomFieldValueTooLong = "Custom field value cannot be longer than {0} characters.";
    public static readonly string UnsupportedCustomFieldEntityType = "This entity type does not support custom fields.";
    public static readonly string CampaignTypeNotSupported = "Only Email campaigns are supported.";
    public static readonly string CampaignLeadRequired = "Please select at least one lead.";
    public static readonly string CampaignLeadsInvalid = "One or more selected leads were not found, are archived, or do not belong to the offering.";
    public static readonly string CampaignLeadEmailRequired = "The following leads have no assigned user email: {0}";

}

internal class SuccessMessages
{
    public static readonly string UserRegistered = "User {0} Registered. Please check {1} to verify your account!";
    public static readonly string UserCreated = "User {0} Created.";
    public static readonly string RoleCreated = "Role {0} Created.";
    public static readonly string RoleUpdated = "Role {0} Updated.";
    public static readonly string RoleDeleted = "Role {0} Deleted.";
    public static readonly string PasswordChanged = "Password Changed Successfully";
    public static readonly string UserRoleAssigned = "User Roles Updated Successfully.";
    public static readonly string ConfirmEmail = "Account Confirmed for E-Mail {0}. Please login";
    public static readonly string ForgotPassword = "Password Reset Mail has been sent to your authorized Email.";
    public static readonly string ForgotPasswordReset = "Password changed successfully, please login";
    public static readonly string UpdatePermissions = "Role permissions updated successfully.";
    public static readonly string UpdateUser = "User updated successfully.";
    public static readonly string UpdateProfile = "Profile updated successfully.";
    public static readonly string RecordAddedSuccessfully = "Record added successfully.";
    public static readonly string RecordUpdatedSuccessfully = "Record updated successfully.";
    public static readonly string ChangesDoneSuccessfully = "Changes done successfully.";
    public static readonly string AppointmentCanceledSuccessfully = "Appointment canceled successfully.";

    public static readonly string AppointmentApproveSuccessfully = "Your appointment on {0} at {1} has been successfully accepted.";
    public static readonly string ParticipantCancelSuccessfully = "Participant has been canceled your appointment";
    public static readonly string RecordDeletedSuccessfully = "{0} deleted successfully.";
    public static readonly string RecordAlreadyExists = "Record already exists.";

    public static readonly string CommonRecordCreated = "Record created successfully";
    public static readonly string CommonRecordUpdated = "Record updated successfully";
}

internal class LoggerMessages
{
}
