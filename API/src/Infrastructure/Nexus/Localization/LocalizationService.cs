using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Models;
using FlowPilot.Application.Common.Models.Response;
using FlowPilot.Application.Nexus.Localization;
using FlowPilot.Application.Nexus.Localization.Models.Request;
using FlowPilot.Application.Nexus.Localization.Models.Response;
using FlowPilot.Infrastructure.Nexus.Localization.DbModels;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Infrastructure.Persistence.Context.Nexus;
using FlowPilot.Infrastructure.SystemConstants;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Nexus.Localization;

public class LocalizationService : ILocalizationService
{
    private readonly NexusDbContext _nexusDbContext;
    public LocalizationService(NexusDbContext nexusBaseDbContext)
    {
        _nexusDbContext = nexusBaseDbContext;
    }

    #region Country Crud
    public async Task<CreateCountryResponse> CreateCountryAsync(CreateCountryRequest request)
    {
        var exists = await _nexusDbContext.Country.SingleOrDefaultAsync(c => c.CountryName.ToLower() == request.CountryName.ToLower());

        if (exists != null)
        {
            throw new ConflictException(string.Format(ErrorMessages.AlreadyExists, request.CountryName));
        }

        var entity = new Country
        {
            CountryName = request.CountryName,
            CountryCode = request.CountryCode,
            DisplayOrder = request.DisplayOrder,
        };

        await _nexusDbContext.Country.AddAsync(entity);
        await _nexusDbContext.SaveChangesAsync();

        var localizations = GetCountryLocalizations().Select(x => new CountryLocalization
        {
            FKCountryId = entity.Id,
            Key = x.Key,
            Value = x.Value
        });

        await _nexusDbContext.CountryLocalization.AddRangeAsync(localizations);
        await _nexusDbContext.SaveChangesAsync();

        return new CreateCountryResponse { Id = entity.Id, Message = SuccessMessages.RecordAddedSuccessfully };
    }

    public async Task<List<ViewCountryResponse>> GetCountryAsync()
    {
        return await _nexusDbContext.Country
            .Select(c => new ViewCountryResponse
            {
                Id = c.Id,
                CountryName = c.CountryName,
                CountryCode = c.CountryCode,
                DisplayOrder = c.DisplayOrder,
            }).OrderBy(c => c.CountryName).ToListAsync();
    }

    public async Task<ViewCountryResponse> GetCountryByIdAsync(DefaultIdType id)
    {
        var entity = await _nexusDbContext.Country.SingleOrDefaultAsync(x => x.Id == id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Country"));

        return entity.Adapt<ViewCountryResponse>();
    }

    public async Task<string> UpdateCountryAsync(UpdateCountryRequest request)
    {
        var entity = await _nexusDbContext.Country.SingleOrDefaultAsync(x => x.Id == request.Id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Country"));

        var existing = await _nexusDbContext.Country.SingleOrDefaultAsync(x => x.CountryName == request.CountryName && x.Id != request.Id);
        if (existing != null)
        {
            throw new ConflictException(string.Format(ErrorMessages.ItemAlreadyExists, request.CountryName));
        }

        entity.CountryName = request.CountryName;
        entity.CountryCode = request.CountryCode;
        entity.DisplayOrder = request.DisplayOrder;

        _nexusDbContext.Country.Update(entity);
        await _nexusDbContext.SaveChangesAsync();

        return SuccessMessages.RecordUpdatedSuccessfully;
    }

    public async Task<string> DeleteCountryAsync(DefaultIdType countryId)
    {

        var entity = await _nexusDbContext.Country.SingleOrDefaultAsync(x => x.Id == countryId);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Item"));

        _nexusDbContext.Country.Update(entity).State = EntityState.Deleted;
        await _nexusDbContext.SaveChangesAsync();

        return string.Format(SuccessMessages.RecordDeletedSuccessfully, entity.CountryName);
    }

    public async Task<List<DropDownItemResponse>> GetLocalizationCountriesAsync()
    {
        return await _nexusDbContext.Country.OrderBy(x => x.DisplayOrder)
            .Select(c => new DropDownItemResponse
            {
                Value = c.Id,
                Text = c.CountryName,
                StrValue = c.CountryCode,
            }).ToListAsync();
    }

    #endregion

    #region CountryLocalization
    public async Task<CreateCountryLocalizationResponse> CreateCountryLocalizationAsync(CreateCountryLocalizationRequest request)
    {
        var country = await _nexusDbContext.Country.SingleOrDefaultAsync(x => x.Id == request.FKCountryId);
        _ = country ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Country"));

        bool keyExists = await _nexusDbContext.CountryLocalization.AnyAsync(x => x.FKCountryId == request.FKCountryId && x.Key.ToLower() == request.Key.ToLower());
        if (keyExists)
        {
            throw new ConflictException(string.Format(ErrorMessages.AlreadyExists, request.Key));
        }

        var entity = new CountryLocalization
        {
            FKCountryId = request.FKCountryId,
            Key = request.Key,
            Value = request.Value
        };

        await _nexusDbContext.CountryLocalization.AddAsync(entity);
        await _nexusDbContext.SaveChangesAsync();

        return new CreateCountryLocalizationResponse
        {
            Id = entity.Id,
            Message = SuccessMessages.RecordAddedSuccessfully
        };
    }

    public async Task<PaginationResponse<ViewCountryLocalizationResponse>> GetCountryLocalizationAsync(SearchCountryLocalizationRequest request)
    {
        var query = _nexusDbContext.CountryLocalization.IgnoreQueryFilters().Where(x => x.FKCountryId == request.CountryId).OrderBy(x => x.Value);

        return await query.PaginatedListAsync<CountryLocalization, ViewCountryLocalizationResponse>(request.PageNumber, request.PageSize);
    }

    public async Task<List<ViewCountryLocalizationResponse>> GetCountryLocalizationAsync(DefaultIdType id)
    {
        var result = await _nexusDbContext.CountryLocalization.IgnoreQueryFilters().Where(x => x.FKCountryId == id).ToListAsync();

        return result.Adapt<List<ViewCountryLocalizationResponse>>();
    }

    public async Task<ViewCountryLocalizationResponse> GetCountryLocalizationByIdAsync(DefaultIdType id)
    {
        var entity = await _nexusDbContext.CountryLocalization.SingleOrDefaultAsync(x => x.Id == id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Country Localization"));

        return entity.Adapt<ViewCountryLocalizationResponse>();
    }

    public async Task<string> UpdateCountryLocalizationAsync(UpdateCountryLocalizationRequest request)
    {
        var entity = await _nexusDbContext.CountryLocalization.SingleOrDefaultAsync(x => x.Id == request.Id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Localization"));

        entity.Key = request.Key;
        entity.Value = request.Value;

        _nexusDbContext.CountryLocalization.Update(entity);
        await _nexusDbContext.SaveChangesAsync();

        return SuccessMessages.RecordUpdatedSuccessfully;
    }

    public async Task RefreshCountryLocalizations()
    {
        var countries = await _nexusDbContext.Country.ToListAsync();
        var defaultLocalizations = GetCountryLocalizations();

        foreach (var country in countries)
        {
            var countryLocalization = await _nexusDbContext.CountryLocalization.Where(x => x.FKCountryId == country.Id).ToListAsync();
            var keys = countryLocalization.Select(x => x.Key).ToList();
            var localizationsToInsert = defaultLocalizations.Where(x => !keys.Contains(x.Key)).ToList();

            foreach (var localization in localizationsToInsert)
            {

                await _nexusDbContext.CountryLocalization.AddAsync(new CountryLocalization
                {
                    FKCountryId = country.Id,
                    Key = localization.Key,
                    Value = localization.Value
                });
            }

            await _nexusDbContext.SaveChangesAsync();
        }
    }

    #endregion

    private List<ViewLocalizationResponse> GetCountryLocalizations()
    {
        return new List<ViewLocalizationResponse>
        {
        new() { Key = "Manage.Languages.Add_DisplayOrder", Value = "Display Order" },
        new() { Key = "Manage.Languages.Edit_DisplayOrder", Value = "Display Order" },
        new() { Key = "Manage.Languages.Grid_DisplayOrder", Value = "Display Order" },
        new() { Key = "Manage.Localization.Grid_Actions", Value = "Actions" },
        new() { Key = "Manage.Localization.Edit_Title", Value = "Edit Details" },
        new() { Key = "Manage.Localization.Edit_Key", Value = "Key" },
        new() { Key = "Manage.Localization.Edit_Value", Value = "Value" },
        new() { Key = "Manage.Languages.Edit_Close", Value = "Close" },
        new() { Key = "Manage.Languages.Edit_Update", Value = "Update" },
        new() { Key = "Manage.Localization.Actions_Actions", Value = "Actions" },
        new() { Key = "Manage.Localization.Actions_Edit", Value = "Edit" },
        new() { Key = "Administrators_Heading", Value = "Administrators" },
        new() { Key = "Manage.Role_Heading", Value = "Manage Roles" },
        new() { Key = "Manage.Users_Heading", Value = "Manage Users" },
        new() { Key = "Manage.Lookups_Heading", Value = "Manage Lookups" },
        new() { Key = "Manage.Nexus.Lookups_Heading", Value = "Manage Nexus Lookups" },
        new() { Key = "Manage.EmailLog_Heading", Value = "Email Log" },
        new() { Key = "Manage.Settings_Heading", Value = "Manage Settings" },
        new() { Key = "Manage.Appointments_Heading", Value = "Manage Appointments" },
        new() { Key = "Manage.EmailTemplates_Heading", Value = "Manage Email Template" },
        new() { Key = "Manage.Languages_Heading", Value = "Manage Languages" },
        new() { Key = "Manage.Role_Breadcrumb", Value = "Manage Roles" },
        new() { Key = "Manage.Role.Grid_Add", Value = "Add" },
        new() { Key = "Manage.Role_Add", Value = "Add" },
        new() { Key = "Manage.Role.Add_RoleName", Value = "Role Name" },
        new() { Key = "Manage.Role.Add_RoleDescription", Value = "Role Description" },
        new() { Key = "Manage.Role.Add_Close", Value = "Close" },
        new() { Key = "Manage.Role.Add_Save", Value = "Save" },
        new() { Key = "Manage.Role.Edit_EditDetails", Value = "Edit Details" },
        new() { Key = "Manage.Role.Edit_RoleName", Value = "Role Name" },
        new() { Key = "Manage.Role.Edit_RoleDescription", Value = "Role Description" },
        new() { Key = "Manage.Role.Edit_Close", Value = "Close" },
        new() { Key = "Manage.Role.Edit_Update", Value = "Update" },
        new() { Key = "Manage.Role.Grid_RoleName", Value = "Role Name" },
        new() { Key = "Manage.Role.Grid_Description", Value = "Description" },
        new() { Key = "Manage.Role.Grid_Actions", Value = "Actions" },
        new() { Key = "Manage.Role.Actions_Edit", Value = "Edit" },
        new() { Key = "Manage.Role.Actions_Delete", Value = "Delete" },
        new() { Key = "Manage.Role.Actions_ManagePermission", Value = "Manage Permission" },
        new() { Key = "Manage.Role.Actions_Actions", Value = "Actions" },
        new() { Key = "Manage.Users_Breadcrumb", Value = "Manage Users" },
        new() { Key = "Manage.Users.Grid_Add", Value = "Add" },
        new() { Key = "Manage.Users.Add_AddNew", Value = "Add New" },
        new() { Key = "Manage.Users.Add_FirstName", Value = "First Name" },
        new() { Key = "Manage.Users.Add_EmailAddress", Value = "Email Address" },
        new() { Key = "Manage.Users.Add_Password", Value = "Password" },
        new() { Key = "Manage.Users.Add_ConfirmPassword", Value = "Confirm Password"},
        new() { Key = "Manage.Users.Add_LastName", Value = "Last Name" },
        new() { Key = "Manage.Users.Add_PhoneNumber", Value = "Phone Number" },
        new() { Key = "Manage.Users.Add_UserTimeZone", Value = "User Time Zone" },
        new() { Key = "Manage.Users.Add_Close", Value = "Close" },
        new() { Key = "Manage.Users.Add_Save", Value = "Save" },
        new() { Key = "Manage.Users.Edit_EditDetails", Value = "Edit Details" },
        new() { Key = "Manage.Users.Edit_FirstName", Value = "First Name" },
        new() { Key = "Manage.Users.Edit_LastName", Value = "Last Name" },
        new() { Key = "Manage.Users.Edit_PhoneNumber", Value = "Phone Number" },
        new() { Key = "Manage.Users.Edit_UserTimeZone", Value = "User Time Zone" },
        new() { Key = "Manage.Users.Edit_CanLogin", Value = "Can Login" },
        new() { Key = "Manage.Users.Edit_Close", Value = "Close" },
        new() { Key = "Manage.Users.Edit_Update", Value = "Update" },
        new() { Key = "Manage.Users.Grid_Name", Value = "Name" },
        new() { Key = "Manage.Users.Grid_EmailAddress", Value = "Email Address" },
        new() { Key = "Manage.Users.Grid_Status", Value = "Status" },
        new() { Key = "Manage.Users.Grid_Actions", Value = "Actions" },
        new() { Key = "Manage.Users.Actions_Actions", Value = "Actions" },
        new() { Key = "Manage.Users.Actions_Edit", Value = "Edit" },
        new() { Key = "Manage.Users.Actions_AssignRoles", Value = "Assign Roles" },
        new() { Key = "Manage.EmailTemplates_Breadcrumb", Value = "Manage Email Templates" },
        new() { Key = "Manage.EmailTemplates.Grid_Add", Value = "Add" },
        new() { Key = "Manage.EmailTemplates.Add_AddNew", Value = "Add New" },
        new() { Key = "Manage.EmailTemplates.Add_Name", Value = "Name" },
        new() { Key = "Manage.EmailTemplates.Add_Description", Value = "Description" },
        new() { Key = "Manage.EmailTemplates.Add_TemplateUsedFor", Value = "Template Used For" },
        new() { Key = "Manage.EmailTemplates.Add_EmailSubject", Value = "Email Subject" },
        new() { Key = "Manage.EmailTemplates.Add_EmailBody", Value = "Email Body" },
        new() { Key = "Manage.EmailTemplates.Add_IsShared", Value = "Is Shared" },
        new() { Key = "Manage.EmailTemplates.Add_Close", Value = "Close" },
        new() { Key = "Manage.EmailTemplates.Add_Save", Value = "Save" },
        new() { Key = "Manage.EmailTemplates.Add.Placeholder_SelectTemplateUsedFor", Value = "Select Template Used For" },
        new() { Key = "Manage.EmailTemplates.Grid_Name", Value = "Name" },
        new() { Key = "Manage.EmailTemplates.Grid_Description", Value = "Description" },
        new() { Key = "Manage.EmailTemplates.Grid_TemplateUsedFor", Value = "Template Used For" },
        new() { Key = "Manage.EmailTemplates.Grid_EmailSubject", Value = "Email Subject" },
        new() { Key = "Manage.EmailTemplates.Grid_IsShared", Value = "Is Shared" },
        new() { Key = "Manage.EmailTemplates.Actions_Actions", Value = "Actions" },
        new() { Key = "Manage.EmailTemplates.Actions_Edit", Value = "Edit" },
        new() { Key = "Manage.EmailTemplates.Actions_Delete", Value = "Delete" },
        new() { Key = "Manage.EmailTemplates.Edit_EditDetails", Value = "Edit Details" },
        new() { Key = "Manage.EmailTemplates.Edit_Name", Value = "Name" },
        new() { Key = "Manage.EmailTemplates.Edit_Description", Value = "Description" },
        new() { Key = "Manage.EmailTemplates.Edit_TemplateUsedFor", Value = "Template Used For" },
        new() { Key = "Manage.EmailTemplates.Edit.Placeholder_SelectTemplateUsedFor", Value = "Select Template Used For" },
        new() { Key = "Manage.EmailTemplates.Edit_EmailSubject", Value = "Email Subject" },
        new() { Key = "Manage.EmailTemplates.Edit_EmailBody", Value = "Email Body" },
        new() { Key = "Manage.EmailTemplates.Edit_IsShared", Value = "Is Shared" },
        new() { Key = "Manage.EmailTemplates.Edit_Close", Value = "Close" },
        new() { Key = "Manage.EmailTemplates.Edit_Update", Value = "Update" },
        new() { Key = "Manage.EmailLog_Breadcrumb", Value = "Email Log" },
        new() { Key = "Manage.EmailLog.Grid_To", Value = "To" },
        new() { Key = "Manage.EmailLog.Grid_Subject", Value = "Subject" },
        new() { Key = "Manage.EmailLog.Grid_DateTime", Value = "Date Time" },
        new() { Key = "Manage.EmailLog.Grid_SentStatus", Value = "Sent Status" },
        new() { Key = "Manage.EmailLog.Grid_Actions", Value = "Actions" },
        new() { Key = "Manage.EmailLog.Grid.Search_To", Value = "Email To" },
        new() { Key = "Manage.EmailLog.Grid.Search_From", Value = "Email From" },
        new() { Key = "Manage.EmailLog.Grid.Search_Subject", Value = "Subject" },
        new() { Key = "Manage.EmailLog.Grid.Search_BySentEmail", Value = "By Sent Email" },
        new() { Key = "Manage.EmailLog.Grid.SearchDD_All", Value = "All" },
        new() { Key = "Manage.EmailLog.Grid.SearchDD_Yes", Value = "Yes" },
        new() { Key = "Manage.EmailLog.Grid.SearchDD_No", Value = "No" },
        new() { Key = "Manage.EmailLog.Grid_Search", Value = "Search" },
        new() { Key = "Manage.EmailLog.Grid_Reset", Value = "Reset" },
        new() { Key = "Manage.Languages_Breadcrumb", Value = "Manage Languages" },
        new() { Key = "Manage.Languages.Grid_Add", Value = "Add" },
        new() { Key = "Manage.Languages.Add_AddCountry", Value = "Add Country" },
        new() { Key = "Manage.Languages.Add_CountryName", Value = "Country Name" },
        new() { Key = "Manage.Languages.Add_CountryCode", Value = "Country Code" },
        new() { Key = "Manage.Languages.Add_Close", Value = "Close" },
        new() { Key = "Manage.Languages.Add_Save", Value = "Save" },
        new() { Key = "Manage.Languages.Grid_CountryName", Value = "Country Name" },
        new() { Key = "Manage.Languages.Grid_CountryCode", Value = "Country Code" },
        new() { Key = "Manage.Languages.Grid_Actions", Value = "Actions" },
        new() { Key = "Manage.Languages.Actions_Edit", Value = "Edit" },
        new() { Key = "Manage.Languages.Actions_View", Value = "View" },
        new() { Key = "Manage.Languages.Actions_Delete", Value = "Delete" },
        new() { Key = "Manage.Languages.Actions_Actions", Value = "Actions" },
        new() { Key = "Manage.Languages.Edit_EditDetails", Value = "Edit Details" },
        new() { Key = "Manage.Languages.Edit_CountryName", Value = "Country Name" },
        new() { Key = "Manage.Languages.Edit_CountryCode", Value = "Country Code" },
        new() { Key = "Manage.Languages.Edit_Close", Value = "Close" },
        new() { Key = "Manage.Languages.Edit_Update", Value = "Update" },
        new() { Key = "Manage.Localization_Heading", Value = "Manage Localization" },
        new() { Key = "Manage.Localization_Breadcrumb", Value = "Manage Localization" },
        new() { Key = "Manage.Localization.Grid_Add", Value = "Add" },
        new() { Key = "Manage.Localization.Add_AddLocalization", Value = "Add Localization" },
        new() { Key = "Manage.Localization.Add_Key", Value = "Key" },
        new() { Key = "Manage.Localization.Add_Value", Value = "Value" },
        new() { Key = "Manage.Localization.Add_Close", Value = "Close" },
        new() { Key = "Manage.Localization.Add_Save", Value = "Save" },
        new() { Key = "Manage.Localization.Grid_Key", Value = "Key" },
        new() { Key = "Manage.Localization.Grid_Value", Value = "Value" },
        new() { Key = "Manage.Lookups_Breadcrumb", Value = "Manage Lookups" },
        new() { Key = "Manage.Lookups.Grid_Name", Value = "Name" },
        new() { Key = "Manage.Lookups.Grid_Actions", Value = "Actions" },
        new() { Key = "Manage.Lookups.Actions_Actions", Value = "Actions" },
        new() { Key = "Manage.Lookups.Actions_ViewValues", Value = "View Values" },
        new() { Key = "Manage.Nexus.Lookups_Breadcrumb", Value = "Manage Nexus Lookups" },
        new() { Key = "Manage.Nexus.Lookups.Grid_Name", Value = "Name" },
        new() { Key = "Manage.Nexus.Lookups.Grid_Actions", Value = "Actions" },
        new() { Key = "Manage.Nexus.Lookups.Actions_Actions", Value = "Actions" },
        new() { Key = "Manage.Settings_Breadcrumb", Value = "Manage Settings" },
        new() { Key = "Manage.Settings.Grid_Description", Value = "Description" },
        new() { Key = "Manage.Settings.Grid_Actions", Value = "Actions" },
        new() { Key = "Manage.Profile_Heading", Value = "My Account" },
        new() { Key = "Manage.Profile_Breadcrumb", Value = "My Account" },
        new() { Key = "Manage.Profile_SubName", Value = "Profile" },
        new() { Key = "Manage.Profile.Edit_EditProfile", Value = "Edit Profile" },
        new() { Key = "Manage.Profile.Edit_FirstName", Value = "First Name" },
        new() { Key = "Manage.Profile.Edit_PhoneNumber", Value = "Phone Number" },
        new() { Key = "Manage.Profile.Edit_LastName", Value = "Last Name" },
        new() { Key = "Manage.Profile.Edit_TimeZone", Value = "Time Zone" },
        new() { Key = "Manage.Profile.Edit_UpdateProfile", Value = "Update Profile" },
        new() { Key = "Manage.Profile.Edit_ChangePic", Value = "Change Pic" },
        new() { Key = "Manage.Profile.Edit_ChangePassword", Value = "Change Password" },
        new() { Key = "Manage.Profile.Edit_OldPassword", Value = "Old Password" },
        new() { Key = "Manage.Profile.Edit_NewPassword", Value = "New Password" },
        new() { Key = "Manage.Profile.Edit_ConfirmPassword", Value = "Confirm Password" },
        new() { Key = "Manage.Profile.Edit_BtnChangePassword", Value = "Change Password" },
        new() { Key = "Manage.Permissions.Edit_Heading", Value = "Manage Permissions" },
        new() { Key = "Manage.Permissions.Edit_Close", Value = "Close" },
        new() { Key = "Manage.Permissions.Edit_Update", Value = "Update" },
        new() { Key = "Manage.Role.Delete_Title", Value = "Delete Item" },
        new() { Key = "Manage.Role.Delete_Description", Value = "Are you sure you want to delete this item? This action cannot be undone." },
        new() { Key = "Manage.Role.Delete_ConfirmBtn", Value = "Yes, Delete" },
        new() { Key = "Manage.Helper.Delete_Cancel", Value = "Cancel" },
        new() { Key = "Manage.Users.Add.Placeholder_Choose", Value = "Choose..." },
        new() { Key = "Manage.Users.Edit.Placeholder_Choose", Value = "Choose..." },
        new() { Key = "Manage.AssignRole.Grid_Name", Value = "Name" },
        new() { Key = "Manage.AssignRole.Grid_Description", Value = "Description" },
        new() { Key = "Manage.AssignRole.AssignRole_Heading", Value = "Assign Role" },
        new() { Key = "Manage.AssignRole.Grid_Select", Value = "Select" },
        new() { Key = "Manage.AssignRole.Add_Close", Value = "Close" },
        new() { Key = "Manage.AssignRole.Add_Update", Value = "Update" },
        new() { Key = "Manage.Values_Heading", Value = "Manage Values" },
        new() { Key = "Manage.Values_Breadcrumb", Value = "Manage Lookup Values" },
        new() { Key = "Manage.Values_Subtitle", Value = "Manage Lookups" },
        new() { Key = "Manage.Values.Administrators_Subtitle", Value = "Administrators" },
        new() { Key = "Manage.Values.Grid_Add", Value = "Add" },
        new() { Key = "Manage.Values.Grid_Name", Value = "Name" },
        new() { Key = "Manage.Values.Grid_DisplayOrder", Value = "Display Order" },
        new() { Key = "Manage.Values.Grid_Status", Value = "Status" },
        new() { Key = "Manage.Values.Grid_Actions", Value = "Actions" },
        new() { Key = "Manage.Values.Add_AddNew", Value = "Add New" },
        new() { Key = "Manage.Values.Add_Value", Value = "Value" },
        new() { Key = "Manage.Values.Add_DisplayOrder", Value = "Display Order" },
        new() { Key = "Manage.Values.Add_IsActive", Value = "IsActive" },
        new() { Key = "Manage.Values.Add_Close", Value = "Close" },
        new() { Key = "Manage.Values.Add_Save", Value = "Save" },
        new() { Key = "Manage.Values.Actions_Actions", Value = "Actions" },
        new() { Key = "Manage.Values.Actions_Edit", Value = "Edit" },
        new() { Key = "Manage.Values.Edit_EditDetails", Value = "Edit Details" },
        new() { Key = "Manage.Values.Edit_Value", Value = "Value" },
        new() { Key = "Manage.Values.Edit_DisplayOrder", Value = "Display Order" },
        new() { Key = "Manage.Values.Edit_IsActive", Value = "Is Active" },
        new() { Key = "Manage.Values.Edit_Close", Value = "Close" },
        new() { Key = "Manage.Values.Edit_Update", Value = "Update" },
        new() { Key = "Manage.Nexus.Values.ManageValues_Heading", Value = "Manage Values" },
        new() { Key = "Manage.Nexus.Values.ManageValues_Breadcrumb", Value = "Manage Values" },
        new() { Key = "Manage.Nexus.Values.Administrators_Subtitle", Value = "Administrators" },
        new() { Key = "Manage.Nexus.Values.ManageNexusLookups_Subtitle", Value = "Manage Nexus Lookups" },
        new() { Key = "Manage.Nexus.Values.Grid_Add", Value = "Add" },
        new() { Key = "Manage.Nexus.Values.Add_AddNew", Value = "Add New" },
        new() { Key = "Manage.Nexus.Values.Add_Value", Value = "Value" },
        new() { Key = "Manage.Nexus.Values.Add_DisplayOrder", Value = "Display Order" },
        new() { Key = "Manage.Nexus.Values.Add_IsActive", Value = "Is Active" },
        new() { Key = "Manage.Nexus.Values.Add_IsDefault", Value = "Is Default" },
        new() { Key = "Manage.Nexus.Values.Add_Close", Value = "Close" },
        new() { Key = "Manage.Nexus.Values.Add_Save", Value = "Save" },
        new() { Key = "Manage.Nexus.Values.Grid_Name", Value = "Name" },
        new() { Key = "Manage.Nexus.Values.Grid_DisplayOrder", Value = "Display Order" },
        new() { Key = "Manage.Nexus.Values.Grid_Status", Value = "Status" },
        new() { Key = "Manage.Nexus.Values.Grid_IsDefault", Value = "Is Default" },
        new() { Key = "Manage.Nexus.Values.Grid_Actions", Value = "Actions" },
        new() { Key = "Manage.Nexus.Values.Actions_Actions", Value = "Actions" },
        new() { Key = "Manage.Nexus.Values.Actions_Edit", Value = "Edit" },
        new() { Key = "Manage.Nexus.Values.Edit_EditDetails", Value = "Edit Details" },
        new() { Key = "Manage.Nexus.Values.Edit_Value", Value = "Value" },
        new() { Key = "Manage.Nexus.Values.Edit_DisplayOrder", Value = "Display Order" },
        new() { Key = "Manage.Nexus.Values.Edit_IsActive", Value = "Is Active" },
        new() { Key = "Manage.Nexus.Values.Edit_IsDefault", Value = "Is Default" },
        new() { Key = "Manage.Nexus.Values.Edit_Close", Value = "Close" },
        new() { Key = "Manage.Nexus.Values.Edit_Update", Value = "Update" },
        new() { Key = "Manage.Appointment.Settings_Heading", Value = "Appointment Settings" },
        new() { Key = "Manage.Appointment.Settings_Breadcrumb", Value = "Appointment Settings" },
        new() { Key = "Manage.Appointment.Settings.Administrator_Subtitle", Value = "Administrator" },
        new() { Key = "Manage.Appointment.Settings.Settings_Subtitle", Value = "Settings" },
        new() { Key = "Manage.Appointment.Settings.Tab_AppointmentCreateSetting", Value = "Appointment Create Setting" },
        new() { Key = "Manage.Appointment.Settings.Tab_AppointmentCreateEmail", Value = "Appointment Create Email" },
        new() { Key = "Manage.Appointment.Settings.Tab_AppointmentCreateReminderEmail", Value = "Appointment Create Reminder Email" },
        new() { Key = "Manage.Appointment.Settings.Tab_AppointmentCancelledEmailForAttendee", Value = "Appointment Cancelled Email For Attendee" },
        new() { Key = "Manage.Appointment.Settings.Tab_AppointmentCancelledEmailForHost", Value = "Appointment Cancelled Email For Host" },
        new() { Key = "Manage.Appointment.Settings.Tab_AppointmentSystemCancelledEmailForAttendee", Value = "Appointment System Cancelled Email For Attendee" },
        new() { Key = "Manage.Appointment.Settings.Tab_AppointmentSystemCancelledEmailForHost", Value = "Appointment System Cancelled Email For Host" },
        new() { Key = "Manage.Appointment.Settings.Tab_AppointmentRescheduledEmail", Value = "Appointment Rescheduled Email" },
        new() { Key = "Manage.Appointment.Settings.Tab.AppointmentSettings_Heading", Value = "Appointment Setting" },
        new() { Key = "Manage.Appointment.Settings.Tab_RemainderDays", Value = "Reminder Days (after initial email)" },
        new() { Key = "Manage.Appointment.Settings.Tab_Action", Value = "Action" },
        new() { Key = "Manage.Appointment.Settings.Tab.Placeholder_EnterRemainingDays", Value = "Enter reminder days" },
        new() { Key = "Manage.Appointment.Settings.Tab_Remove", Value = "Remove" },
        new() { Key = "Manage.Appointment.Settings.Tab_IncludeFinalRemainder", Value = "Include Final Reminder Before Appointment" },
        new() { Key = "Manage.Appointment.Settings.Tab_IsAutoAppointment", Value = "Is Auto Appointment Cancel Enabled" },
        new() { Key = "Manage.Appointment.Settings.Tab_AppointmetColor", Value = "Appointment Color Settings" },
        new() { Key = "Manage.Appointment.Settings.Tab_AddMore", Value = "Add More" },
        new() { Key = "Manage.Appointment.Settings.Tab_Update", Value = "Update" },
        new() { Key = "Manage.Appointment.Settings.Tab_Subject", Value = "Subject" },
        new() { Key = "Manage.Appointment.Settings.Tab_Body", Value = "Body" },
        new() { Key = "Manage.Appointment.Settings.Tab2_Update", Value = "Update" },
        new() { Key = "Manage.Approved.Appointment_Heading", Value = "Approved Appointment Settings" },
        new() { Key = "Manage.Approved.Appointment.Adminstrator_Subtitle", Value = "Administrator" },
        new() { Key = "Manage.Approved.Appointment.Settings_Subtitle", Value = "Settings" },
        new() { Key = "Manage.Approved.Appointment.Settings_Breadcrumb", Value = "Appointment Settings" },
        new() { Key = "Manage.Approved.Appointment.Tab_ApprovedAppointment", Value = "Approved Appointment Setting" },
        new() { Key = "Manage.Approved.Appointment.Tab_AppointmentConfirmed", Value = "Appointment Confirmed Email For Host" },
        new() { Key = "Manage.Approved.Appointment.Tab_AppointmentDeclined", Value = "Appointment Declined Email For Host" },
        new() { Key = "Manage.Approved.Appointment.Tab_AppointmentConfirmedForParticipant", Value = "Appointment Confirmed Email For Participant" },
        new() { Key = "Manage.Approved.Appointment.Tab_AppointmentDeclinedForParticipant", Value = "Appointment Declined Email For Participant" },
        new() { Key = "Manage.Approved.Appointment.Tab_AppointmentConfirmedRemainderEmailForParticipant", Value = "Confirmed Reminder Email For Participants" },
        new() { Key = "Manage.Approved.Appointment.Tab_ConfirmedRemainderEmailForHost", Value = "Confirmed Reminder Email For Host" },
        new() { Key = "Manage.Approved.Appointment.Tab_ApprovedAppointmentHeading", Value = "Approved Appointment Settings" },
        new() { Key = "Manage.Approved.Appointment.Tab_ReminderBeforeDays", Value = "Reminder Before Days" },
        new() { Key = "Manage.Approved.Appointment.Tab.Placeholder_EnterReminderDays", Value = "Enter reminder days before appointment" },
        new() { Key = "Manage.Approved.Appointment.Tab_LastReminderBeforeHours", Value = "Last Reminder Before Hours" },
        new() { Key = "Manage.Approved.Appointment.Tab.Placeholder_EnterHours", Value = "Enter hours before appointment" },
        new() { Key = "Manage.Approved.Appointment.Tab_Update", Value = "Update" },
        new() { Key = "Manage.Approved.Appointment.Tab_Subject", Value = "Subject" },
        new() { Key = "Manage.Approved.Appointment.Tab_Body", Value = "Body" },
        new() { Key = "Manage.Approved.Appointment.AllTab_Update", Value = "Update" },
        new() { Key = "Manage.Appointments_Breadcrumb", Value = "Manage Appointments" },
        new() { Key = "Manage.Appointments.Grid_Add", Value = "Add" },
        new() { Key = "Manage.Appointments.Search_ByAppointmentStatus", Value = "By Appointment Status" },
        new() { Key = "Manage.Appointments.Search_ByHostUser", Value = "By Host User" },
        new() { Key = "Manage.Appointments.Search_ByGuestUser", Value = "By Guest User" },
        new() { Key = "Manage.Appointments.Search_SearchBtn", Value = "Search" },
        new() { Key = "Manage.Appointments.Search_ResetBtn", Value = "Reset" },
        new() { Key = "Manage.Appointments.Add_Heading", Value = "Add New Appointment" },
        new() { Key = "Manage.Appointments.Add_Title", Value = "Title" },
        new() { Key = "Manage.Appointments.Add.Placeholder_Title", Value = "Enter Title" },
        new() { Key = "Manage.Appointments.Add_LocationType", Value = "Location Type" },
        new() { Key = "Manage.Appointments.Add.DD_SelectLocation", Value = "Select Location" },
        new() { Key = "Manage.Appointments.Add_Duration", Value = "Duration (Minutes)" },
        new() { Key = "Manage.Appointments.Add.DD_SelectDuration", Value = "Select Duration" },
        new() { Key = "Manage.Appointments.Add_AppointmentApproval", Value = "Appointment Approval Rule" },
        new() { Key = "Manage.Appointments.Add.DD_SelectApproval", Value = "Select Approval Rule" },
        new() { Key = "Manage.Appointments.Add_InviteRequired", Value = "Invite Required Participants" },
        new() { Key = "Manage.Appointments.Add_InviteOptional", Value = "Invite Optional Participants" },
        new() { Key = "Manage.Appointments.Add_Description", Value = "Description" },
        new() { Key = "Manage.Appointments.Add_Close", Value = "Close" },
        new() { Key = "Manage.Appointments.Add_SaveChanges", Value = "Save Changes" },
        new() { Key = "Manage.Appointments.Add.Placeholder_EnterDescription", Value = "Enter Description" },
        new() { Key = "Manage.Appointments.Edit_AppointmentDetails", Value = "Appointment Details" },
        new() { Key = "Manage.Appointments.Edit_Title", Value = "Title" },
        new() { Key = "Manage.Appointments.Edit_Description", Value = "Description" },
        new() { Key = "Manage.Appointments.Edit_Duration", Value = "Duration" },
        new() { Key = "Manage.Appointments.Edit_LocationType", Value = "Location Type" },
        new() { Key = "Manage.Appointments.Edit_Status", Value = "Status" },
        new() { Key = "Manage.Appointments.Edit_ApprovalRule", Value = "Approval Rule" },
        new() { Key = "Manage.Appointments.Edit_MultipleParticipant", Value = "Multiple Participant Per Slot" },
        new() { Key = "Manage.Appointments.Edit_CancelledBy", Value = "Cancelled By" },
        new() { Key = "Manage.Appointments.Edit_CancellationReason", Value = "Cancellation Reason" },
        new() { Key = "Manage.Appointments.Edit_AvailabilityWindows", Value = "Availability Windows" },
        new() { Key = "Manage.Appointments.Edit_Participant", Value = "Participants" },
        new() { Key = "Manage.Appointments.Edit_HostParticipants", Value = "Host Participants" },
        new() { Key = "Manage.Appointments.Edit_Close", Value = "Close" },
        new() { Key = "Manage.Appointments.Edit_CancelAppointment", Value = "Cancel Appointment" },
        new() { Key = "Manage.Appointments.Edit_RescheduleAppointment", Value = "Reschedule Appointment" },
        new() { Key = "Manage.Appointments.Grid_Name", Value = "Name" },
        new() { Key = "Manage.Appointments.Grid_Role", Value = "Role" },
        new() { Key = "Manage.Appointments.Grid_Status", Value = "Status" },
        new() { Key = "Manage.Appointments.Grid_DeclinedReason", Value = "Declined Reason" },
        new() { Key = "Manage.Appointments.Grid_BookedAppointment", Value = "Booked Appointment" },
        new() { Key = "Manage.Appointments.Grid_DeclinedAt", Value = "Declined At" },
        new() { Key = "Manage.Appointments.Reschedule_Heading", Value = "Reschedule Appointment" },
        new() { Key = "Manage.Appointments.Reschedule_Title", Value = "Title" },
        new() { Key = "Manage.Appointments.Reschedule_LocationType", Value = "Location Type" },
        new() { Key = "Manage.Appointments.Reschedule_Duration", Value = "Duration (Mintues)" },
        new() { Key = "Manage.Appointments.Reschedule_AppointmentApproval", Value = "Appointment Approval Rule" },
        new() { Key = "Manage.Appointments.Reschedule_InviteRequired", Value = "Invite Required Participants" },
        new() { Key = "Manage.Appointments.Reschedule_Description", Value = "Description" },
        new() { Key = "Manage.Appointments.Reschedule_InviteOptional", Value = "Invite Optional Participants" },
        new() { Key = "Manage.Appointments.Reschedule_Close", Value = "Close" },
        new() { Key = "Manage.Appointments.Reschedule_CreateRescheduled", Value = "Create Rescheduled Appointment" },
        new() { Key = "Manage.Appointments.Schedule_Heading", Value = "Appointment Schedule" },
        new() { Key = "Manage.Appointments.Schedule_Date", Value = "Date" },
        new() { Key = "Manage.Appointments.Schedule_From", Value = "From" },
        new() { Key = "Manage.Appointments.Schedule_To", Value = "To" },
        new() { Key = "Manage.Language.Delete_Title", Value = "Delete Item" },
        new() { Key = "Manage.Language.Delete_Description", Value = "Are you sure you want to delete this item? This action cannot be undone." },
        new() { Key = "Manage.Language.Delete_Confirm", Value = "Yes, Delete" },
        new() { Key = "Manage.EmailTemplates.Delete_Title", Value = "Delete Email Template" },
        new() { Key = "Manage.EmailTemplates.Delete_Description", Value = "Are you sure you want to delete this email template? This action cannot be undone." },
        new() { Key = "Manage.EmailTemplates.Delete_Confirm", Value = "Yes, Delete" },
        new() { Key = "Manage.Appointment.Cancel_Heading", Value = "Cancel Appointment" },
        new() { Key = "Manage.Appointment.Cancel_CancelReason", Value = "Cancel Reason" },
        new() { Key = "Manage.Appointment.Cancel.Placeholder_CancelReason", Value = "Enter Cancellation Reason" },
        new() { Key = "Manage.Appointment.Cancel_Close", Value = "Close" },
        new() { Key = "Manage.Appointment.Cancel_CancelAppointment", Value = "Cancel Appointment" },
        new() { Key = "Manage.Appointment.Delete_Description", Value = "Are you sure you want to cancel this appointment? This action cannot be undone." },
        new() { Key = "Manage.Appointment.Delete_Title", Value = "Cancel Appointment" },
        new() { Key = "Manage.Appointment.Delete_Confirm", Value = "Yes, Cancel" },
        new() { Key = "Manage.Localization.Edit_Close", Value = "Close" },
        new() { Key = "Manage.Localization.Edit_Update", Value = "Update"},
        new() { Key = "Manage.Tenants_Heading", Value = "Manage Tenants"},
        new() { Key = "Manage.Tenants.Breadcrumb", Value = "Manage Tenants"},
        new() { Key = "Manage.Tenants.Grid_TenantsName", Value = "Tenants Name"},
        new() { Key = "Manage.Tenants.Grid_AdminEmail", Value = "Admin Email"},
        new() { Key = "Manage.Tenants.Grid_StripeCustomerId", Value = "Stripe CustomerID"},
        new() { Key = "Manage.Tenants.Grid_CreateOn", Value = "Created On"},
        new() { Key = "Manage.Tenants.Grid_Status", Value = "Status"},
        new() { Key = "Manage.Tenants.Grid.Search_Tenants", Value = "Search Tenants"},
        new() { Key = "Manage.Tenants.Grid.Search_Status", Value = "Status"},
        new() { Key = "Manage.Tenants.Grid.Search_All", Value = "All"},
        new() { Key = "Manage.Tenants.Grid.Search_Active", Value = "Active"},
        new() { Key = "Manage.Tenants.Grid.Search_Inactive", Value = "Inactive"},
        new() { Key = "Manage.Tenants.Grid.Search_Btn", Value = "Search"},
        new() { Key = "Manage.Tenants.Grid.Reset_Btn", Value = "Reset"},
        new() { Key = "Manage.Administration.ParentHeading_UserManagement", Value = "User Management"},
        new() { Key = "Manage.UserManagement.ManageRoles", Value = "Manage Roles"},
        new() { Key = "Manage.UserManagement.ManageUsers", Value = "Manage Users"},
        new() { Key = "Manage.Administration.ParentHeading_NexusManagement", Value = "Nexus Management"},
        new() { Key = "Manage.NexusManagement.ManageLanguages", Value = "Manage Languages"},
        new() { Key = "Manage.NexusManagement.ManageNexusLookups", Value = "Manage Nexus Lookups"},
        new() { Key = "Manage.NexusManagement.ManageTenants", Value = "Manage Tenants"},
        new() { Key = "Manage.Administration.ParentHeading_ListManagement", Value = "List Management"},
        new() { Key = "Manage.ListManagement.ManageLookups", Value = "Manage Lookups"},
        new() { Key = "Manage.Administrator_Heading", Value = "Administrator"},
        new() { Key = "Manage.Tenants.Grid.Reset_Btn", Value = "Reset"},
        new() { Key = "Manage.Tenants.Grid.Actions_Actions", Value = "Action"},
        new() { Key = "Manage.Tenants.Grid.Actions_View", Value = "View"},
        new() { Key = "Manage.Tenants.Grid.Actions_Edit", Value = "Edit"},
        new() { Key = "Manage.Tenants.Edit.Heading", Value = "Edit Tenant Details"},
        new() { Key = "Manage.Tenants.Edit.Breadcrumb", Value = "Edit"},
        new() { Key = "Manage.Tenant.Edit_Name", Value = "Name"},
        new() { Key = "Manage.Tenant.Edit_Email", Value = "Email"},
        new() { Key = "Manage.Tenant.Edit_IsActive", Value = "Is Active"},
        new() { Key = "Manage.Tenant.Edit_Update", Value = "Update"},
        new() { Key = "Manage.Tenants.Grid.Actions_ChangePassword", Value = "Change Password"},

        new() { Key = "Manage.Users.Actions_ChangePassword", Value = "Change Password" },
        new() { Key = "Manage.User.ChangeUserPassword_Heading", Value = "Change User Password" },
        new() { Key = "Manage.User.ChangeUserPassword_Close", Value = "Close" },
        new() { Key = "Manage.User.ChangeUserPassword_Save", Value = "Save" },
        new() { Key = "Manage.User.ChangeUserPassword.New_Password", Value = "New Password" },
        new() { Key = "Manage.User.ChangeUserPassword.Confirm_Password", Value = "Confirm Password" },

        new() { Key = "Manage.My_Subscriptions_Heading", Value = "My Subscriptions" },
        new() { Key = "Manage.My_Subscriptions_Breadcrumb", Value = "My Subscriptions" },

        new() { Key = "Manage.Forms_Heading", Value = "Manage Forms" },
        new() { Key = "Manage.Forms.Breadcrumb", Value = "Manage Forms"},
        new() { Key = "Manage.Forms.Add_Btn", Value = "Add"},
        new() { Key = "Manage.Forms.Add_Heading", Value="Add Form"},
        new() { Key = "Manage.Forms.Add.BreadCrumb", Value = "Add"},
        new() { Key = "Manage.Forms.Add_Name", Value = "Name"},
        new() { Key = "Manage.Forms.Add_Description", Value = "Description"},
        new() { Key = "Manage.Forms.Add_IntroductionText", Value = "Introduction Text"},
        new() { Key = "Manage.Forms.Add_FormStatus", Value = "Form Status"},
        new() { Key = "Manage.Forms.Add_SaveBtn", Value = "Save"},
        new() { Key = "Manage.Forms.Grid_Name", Value = "Name"},
        new() { Key = "Manage.Forms.Grid_Description", Value = "Description"},
        new() { Key = "Manage.Forms.Grid_Status", Value = "Status"},
        new() { Key = "Manage.Forms.Grid_Action", Value = "Action"},
        new() { Key = "Manage.Forms.Actions_Actions", Value = "Action"},
        new() { Key = "Manage.Forms.Action_Edit", Value = "Edit"},
        new() { Key = "Manage.Forms.Action_Delete", Value = "Delete"},
        new() { Key = "Manage.Forms.Edit_Heading", Value = "Edit"},
        new() { Key = "Manage.Forms.Edit.BreadCrumb", Value = "Edit"},
        new() { Key = "Manage.Forms.Edit.Edit_Form_Tab_Title", Value = "Edit Form"},
        new() { Key = "Manage.Forms.Edit.FormPage.Form_Page_Tab_Title", Value = "Manage Form Page"},

        new() { Key = "Manage.Forms.Edit_Name", Value = "Name"},
        new() { Key = "Manage.Forms.Edit_Description", Value = "Description"},
        new() { Key = "Manage.Forms.Edit_IntroductionText", Value = "Introduction Text"},
        new() { Key = "Manage.Forms.Edit_FormStatus", Value = "Form Status"},
        new() { Key = "Manage.Forms.Edit_UpdateBtn", Value = "Update"},

        new() { Key = "Manage.Form.FormPages.Add_Btn", Value = "Add Page"},
        new() { Key = "Manage.Form.FormPages.Add_AddNew", Value = "Add New" },
        new() { Key = "Manage.Form.FormPages.Add_Title", Value = "Title" },
        new() { Key = "Manage.Form.FormPages.Add_Description", Value = "Description" },
        new() { Key = "Manage.Form.FormPages.Add_IntroText", Value = "Intro Text" },
        new() { Key = "Manage.Form.FormPages.Add_DisplayOrder", Value = "Display Order" },
        new() { Key = "Manage.Form.FormPages.Add_Close", Value = "Close" },
        new() { Key = "Manage.Form.FormPages.Add_Save", Value = "Save" },

        new() { Key = "Manage.Form.FormPages.Edit_Btn", Value = "Edit Page"},
        new() { Key = "Manage.Form.FormPages.Edit_EditFormPage", Value = "Edit Page" },
        new() { Key = "Manage.Form.FormPages.Edit_Title", Value = "Title" },
        new() { Key = "Manage.Form.FormPages.Edit_Description", Value = "Description" },
        new() { Key = "Manage.Form.FormPages.Edit_IntroText", Value = "Intro Text" },
        new() { Key = "Manage.Form.FormPages.Edit_DisplayOrder", Value = "Display Order" },
        new() { Key = "Manage.Form.FormPages.Edit_Close", Value = "Close" },
        new() { Key = "Manage.Form.FormPages.Edit_Update", Value = "Update" },
        new() { Key = "Manage.Form.FormPages.Grid_Title", Value = "Title"},
        new() { Key = "Manage.Form.FormPages.Grid_Description", Value = "Description"},
        new() { Key = "Manage.Form.FormPages.Grid_DisplayOrder", Value = "Display Order"},
        new() { Key = "Manage.Form.FormPages.Grid_Action", Value = "Action"},
        new() { Key = "Manage.Form.FormPages.Actions_Actions", Value = "Action"},
        new() { Key = "Manage.Form.FormPages.Action_Edit", Value = "Edit"},
        new() { Key = "Manage.Form.FormPages.Action_Delete", Value = "Delete"},
        new() { Key = "Manage.Form.FormPages.Action_ManageFormPageTabs", Value = "Manage Tabs"},
        new() { Key = "Manage.FormPage.Tabs.Add_Name", Value = "Name"},
        new() { Key = "Manage.FormPage.Tabs.Add_DisplayOrder", Value = "Display Order"},
        new() { Key = "Manage.FormPage.Tabs.Save_Btn", Value = "Save"},
        new() { Key = "Manage.FormPage.Tabs.Edit_Name", Value = "Name"},
        new() { Key = "Manage.FormPage.Tabs.Edit_DisplayOrder", Value = "Display Order"},
        new() { Key = "Manage.FormPage.Tabs.Update_Btn", Value = "Update"},
        new() { Key = "Manage.FormPage.Tabs.Heading", Value = "Manage Form Page Tabs"},
        new() { Key = "Manage.FormPage.Tabs.Grid_Name", Value = "Name"},
        new() { Key = "Manage.FormPage.Tabs.Grid_DisplayOrder", Value = "Display Order"},
        new() { Key = "Manage.FormPage.Tabs.Grid_Action", Value = "Action"},
        new() { Key = "Manage.FormPage.Tabs.Actions_Actions", Value = "Action"},
        new() { Key = "Manage.FormPage.Tabs.Action_Edit", Value = "Edit"},
        new() { Key = "Manage.FormPage.Tabs.Action_Delete", Value = "Delete"},
        new() { Key = "Manage.FormPage.Tabs.Add_ParentTab", Value = "Parent Tab"},
        new() { Key = "Manage.FormPage.Tabs.Grid_ParentTab", Value = "Parent Tab"},
        new() { Key = "Manage.FormPage.Tabs.Cancel_Btn", Value = "Cancel"},
        new() { Key = "Manage.Field.Select_Tab", Value = "Tab"},
        new() { Key = "Manage.Field.Select_Field_Type", Value = "Field Type"},
        new() { Key = "Manage.Fields.Create_Close", Value = "Close"},
        new() { Key = "Manage.Fields.Create_Create", Value = "Create"},
        new() { Key = "Manage.Fields.Heading", Value = "Select Field Type"},
        new() { Key = "Manage.Form.FormPages.Action_ManageField", Value = "Manage Fields"},
        new() { Key = "Manage.Email_Nav_Heading", Value = "Email" },
        new() { Key = "Manage.Admin_Nav_Heading", Value = "Admin" },
        new() { Key = "Manage.Profile.TwoFactor.ConfirmMethodChange", Value = "2FA is currently enabled. Are you sure you want to change the authentication method?" },
        new() { Key = "Manage.Profile.TwoFactor.ConfirmMethodChange_Heading", Value = "Change 2FA Method" },
        new() { Key = "Manage.Profile.TwoFactor.ConfirmMethodChange_ConfirmButtonText", Value = "Change Method" },
        new() { Key = "Manage.SalesPipeline.NewLead", Value = "New Lead" },

        // File uploader
        new() { Key = "Manage.Profile.Drop_Instruction", Value = "Click to upload or drag and drop" },
        new() { Key = "Manage.Profile.Drop_Hint", Value = "SVG, PNG, JPG or GIF (max. 4MB)" },

        new() { Key = "Manage.SalesCrm_Nav_Heading", Value = "Manage Sales CRM" },
        new() { Key = "Manage.Leads_Heading", Value = "Manage Leads" },
        new() { Key = "Manage.Leads.Calendar_Heading", Value = "Calendar" },
        new() { Key = "Manage.SalesPipeline_Heading", Value = "Sales Pipeline" },
        new() { Key = "Manage.Leads.Updated", Value = "Lead updated successfully" },
        new() { Key = "Manage.MyTeam_Heading", Value = "My Team" },

        // Tasks
        new() { Key = "Manage.Tasks_Heading", Value = "Tasks" },
        new() { Key = "Manage.Tasks.Breadcrumb", Value = "Tasks" },
        new() { Key = "Manage.Tasks.Action_Add", Value = "Create Task" },
        new() { Key = "Manage.Tasks.Section_Today", Value = "Today" },
        new() { Key = "Manage.Tasks.Section_Tomorrow", Value = "Tomorrow" },
        new() { Key = "Manage.Tasks.Section_Overdue", Value = "Overdue" },
        new() { Key = "Manage.Tasks.Section_Future", Value = "Future" },
        new() { Key = "Manage.Tasks.Empty_Today", Value = "No tasks for today" },
        new() { Key = "Manage.Tasks.Empty_Tomorrow", Value = "No tasks for tomorrow" },
        new() { Key = "Manage.Tasks.Empty_Overdue", Value = "No overdue tasks" },
        new() { Key = "Manage.Tasks.Empty_Future", Value = "No future tasks" },
        new() { Key = "Manage.Tasks.Add_Title", Value = "Create Task" },
        new() { Key = "Manage.Tasks.Title", Value = "Title" },
        new() { Key = "Manage.Tasks.Title_Placeholder", Value = "Call Sarah Chen — Solaris Labs" },
        new() { Key = "Manage.Tasks.When", Value = "When" },
        new() { Key = "Manage.Tasks.Bucket", Value = "Bucket" },
        new() { Key = "Manage.Tasks.Type", Value = "Type" },
        new() { Key = "Manage.Tasks.Priority", Value = "Priority" },
        new() { Key = "Manage.Tasks.Add_Close", Value = "Close" },
        new() { Key = "Manage.Tasks.Add_Save", Value = "Save" },
        new() { Key = "Manage.Tasks.Completed_Status", Value = "Completed" },
        new() { Key = "Manage.Tasks.Completed_Message", Value = "Task marked as completed" },
        new() { Key = "Manage.Tasks.Calendar_Rescheduled", Value = "Task rescheduled" },
        new() { Key = "Manage.Leads.Calendar_Legend_Task", Value = "Task" },
        new() { Key = "Manage.Offerings_Heading", Value = "Offerings" },
        new() { Key = "Manage.Campaigns_Heading", Value = "Campaigns" },

        };
    }
}

