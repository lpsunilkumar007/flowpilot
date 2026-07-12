using System.Collections.ObjectModel;

namespace FlowPilot.Shared.Authorization;

public static class SystemAction
{
    public const string View = nameof(View);
    public const string Create = nameof(Create);
    public const string Update = nameof(Update);
    public const string Delete = nameof(Delete);
    public const string Export = nameof(Export);
    //public const string ManageRoles = nameof(ManageRoles);
    //public const string ManagePermissions = nameof(ManagePermissions);

}

public static class SystemResource
{
    public const string Users = nameof(Users);
    public const string Roles = nameof(Roles);

    public const string ManageLookUps = nameof(ManageLookUps);

    public const string ManageSettings = nameof(ManageSettings);

    public const string EmailLog = nameof(EmailLog);
    public const string EmailTemplates = nameof(EmailTemplates);

    public const string Appointment = nameof(Appointment);

    public const string MySubscriptions = nameof(MySubscriptions);

    public const string ManageForm = nameof(ManageForm);

    public const string ManageLeads = nameof(ManageLeads);

    #region Nexus
    public const string ManageNexusLookUps = nameof(ManageNexusLookUps);
    public const string ManageNexusSettings = nameof(ManageNexusSettings);

    public const string CountryLocalization = nameof(CountryLocalization);

    public const string Tenants = nameof(Tenants);
    #endregion
}

public class SystemPermissions
{
    private static readonly SystemPermission[] _all = new SystemPermission[]
    {
        // Manage Roles
        new("View Roles", SystemAction.View, SystemResource.Roles,IsRoot: true, IsAdmin: true, IsBasic: false),
        new("Create Roles", SystemAction.Create, SystemResource.Roles,IsRoot: true, IsAdmin: true, IsBasic: false),
        new("Update Roles", SystemAction.Update, SystemResource.Roles,IsRoot: true, IsAdmin: true, IsBasic: false),
        new("Delete Role", SystemAction.Delete, SystemResource.Roles,IsRoot: true, IsAdmin: true, IsBasic: false),

        // Manage Users
        new("View User", SystemAction.View, SystemResource.Users, IsRoot : true, IsAdmin : true, IsBasic : false),
        new("Create User", SystemAction.Create, SystemResource.Users, IsRoot : true, IsAdmin : true, IsBasic : false),
        new("Update User", SystemAction.Update, SystemResource.Users, IsRoot : true, IsAdmin : true, IsBasic : false),

        // Manage Lookup and LookupValues
        new("View Lookups and Values", SystemAction.View, SystemResource.ManageLookUps, IsRoot : true, IsAdmin : true, IsBasic : false),
        new("Create Lookup Values", SystemAction.Create, SystemResource.ManageLookUps, IsRoot : true, IsAdmin : true, IsBasic : false),
        new("Update Lookup Values", SystemAction.Update, SystemResource.ManageLookUps, IsRoot : true, IsAdmin : true, IsBasic : false),

        // Manage Settings
        new("View Forms", SystemAction.View, SystemResource.ManageSettings, IsRoot : true, IsAdmin : true, IsBasic : false),
        new("Update Forms", SystemAction.Update, SystemResource.ManageSettings, IsRoot : true, IsAdmin : true, IsBasic : false),

        // Email Log
        new("View Email Log", SystemAction.View, SystemResource.EmailLog, IsRoot : true, IsAdmin : true, IsBasic : true),      


        // Manage Appointments
        new("View Appointment", SystemAction.View, SystemResource.Appointment, IsRoot : true, IsAdmin : true, IsBasic : true),
        new("Create Appointment", SystemAction.Create, SystemResource.Appointment, IsRoot : true, IsAdmin : true, IsBasic : true),
        new("Update Appointment", SystemAction.Update, SystemResource.Appointment, IsRoot : true, IsAdmin : true, IsBasic : true),

        // Manage Forms
        new("View Forms  ", SystemAction.View, SystemResource.ManageForm, IsRoot : true, IsAdmin : true, IsBasic : true),
        new("Create Form", SystemAction.Create, SystemResource.ManageForm, IsRoot : true, IsAdmin : true, IsBasic : false),
        new("Update Form", SystemAction.Update, SystemResource.ManageForm, IsRoot : true, IsAdmin : true, IsBasic : false),
        new("Delete Form", SystemAction.Delete, SystemResource.ManageForm, IsRoot : true, IsAdmin : true, IsBasic : false),

        // Manage Leads (CRM)
        new("View Leads", SystemAction.View, SystemResource.ManageLeads, IsRoot : true, IsAdmin : true, IsBasic : true),
        new("Create Lead", SystemAction.Create, SystemResource.ManageLeads, IsRoot : true, IsAdmin : true, IsBasic : true),
        new("Update Lead", SystemAction.Update, SystemResource.ManageLeads, IsRoot : true, IsAdmin : true, IsBasic : true),
        new("Delete Lead", SystemAction.Delete, SystemResource.ManageLeads, IsRoot : true, IsAdmin : true, IsBasic : false),

        #region Nexus
        // Manage Nexus Lookups
        new("View Nexus LookUps", SystemAction.View, SystemResource.ManageNexusLookUps,IsRoot: true, IsAdmin: false, IsBasic: false),
        new("Create Nexus LookUps", SystemAction.Create, SystemResource.ManageNexusLookUps,IsRoot: true, IsAdmin: false, IsBasic: false),
        new("Update Nexus LookUps", SystemAction.Update, SystemResource.ManageNexusLookUps,IsRoot: true, IsAdmin: false, IsBasic: false),
        new("Delete Nexus LookUps", SystemAction.Delete, SystemResource.ManageNexusLookUps,IsRoot: true, IsAdmin: false, IsBasic: false),

        // Manage Localization
        new("Create Localization", SystemAction.Create, SystemResource.CountryLocalization,IsRoot: true, IsAdmin: false, IsBasic: false),
        new("Update Localization", SystemAction.Update, SystemResource.CountryLocalization,IsRoot: true, IsAdmin: false, IsBasic: false),
        new("Delete Localization", SystemAction.Delete, SystemResource.CountryLocalization,IsRoot: true, IsAdmin: false, IsBasic: false),
        new("View Localization", SystemAction.View, SystemResource.CountryLocalization,IsRoot: true, IsAdmin: false, IsBasic: false),

        // Manage Tenants
        new("View Tenants", SystemAction.View, SystemResource.Tenants,IsRoot: true, IsAdmin: false, IsBasic: false),
        new("Update Tenant", SystemAction.Update, SystemResource.Tenants,IsRoot: true, IsAdmin: false, IsBasic: false),
       

         #endregion

        #region EmailTemplates
        new("View Email Templates", SystemAction.View, SystemResource.EmailTemplates, IsRoot : true, IsAdmin : true, IsBasic : true),
        new("Create Email Template", SystemAction.Create, SystemResource.EmailTemplates, IsRoot : true, IsAdmin : true, IsBasic : true),
        new("Update Email Template", SystemAction.Update, SystemResource.EmailTemplates, IsRoot : true, IsAdmin : true, IsBasic : true),
        new("Delete Email Template", SystemAction.Delete, SystemResource.EmailTemplates, IsRoot : true, IsAdmin : true, IsBasic : true),

        #endregion

        

        #region Subscriptions
        new("View My Subscription Details", SystemAction.View, SystemResource.MySubscriptions,IsRoot: false, IsAdmin: true, IsBasic: false),
        #endregion
    };

    public static IReadOnlyList<SystemPermission> All { get; } = new ReadOnlyCollection<SystemPermission>(_all);
    public static IReadOnlyList<SystemPermission> Root { get; } = new ReadOnlyCollection<SystemPermission>(_all.Where(p => p.IsRoot).ToArray());
    public static IReadOnlyList<SystemPermission> Admin { get; } = new ReadOnlyCollection<SystemPermission>(_all.Where(p => p.IsAdmin).ToArray());
    public static IReadOnlyList<SystemPermission> Basic { get; } = new ReadOnlyCollection<SystemPermission>(_all.Where(p => p.IsBasic).ToArray());
}

public record SystemPermission(string Description, string Action, string Resource, bool IsBasic, bool IsRoot, bool IsAdmin)
{
    public string Name => NameFor(Action, Resource);
    public static string NameFor(string action, string resource) => $"Permissions.{resource}.{action}";
}
