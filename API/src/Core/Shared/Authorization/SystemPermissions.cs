using System.Collections.ObjectModel;

namespace FlowPilot.Shared.Authorization;

public static class SystemAction
{
    public const string View = nameof(View);
    public const string Create = nameof(Create);
    public const string Update = nameof(Update);
    public const string Delete = nameof(Delete);
    public const string Export = nameof(Export);
    public const string ViewDetail = nameof(ViewDetail);
    public const string ViewInfo = nameof(ViewInfo);
    public const string ViewTasks = nameof(ViewTasks);
}

public static class SystemResource
{
    public const string Users = nameof(Users);
    public const string Roles = nameof(Roles);

    public const string ManageLookUps = nameof(ManageLookUps);

    public const string ManageSettings = nameof(ManageSettings);

    public const string EmailLog = nameof(EmailLog);
    public const string EmailTemplates = nameof(EmailTemplates);

    public const string MySubscriptions = nameof(MySubscriptions);

    public const string ManageLeads = nameof(ManageLeads);

    public const string ManageOfferings = nameof(ManageOfferings);

    public const string ManageLeadCalendar = nameof(ManageLeadCalendar);

    public const string ManageTasks = nameof(ManageTasks);

    public const string ManageLeadVisits = nameof(ManageLeadVisits);

    public const string ManageLeadActivities = nameof(ManageLeadActivities);

    public const string ManageLeadNotes = nameof(ManageLeadNotes);

    public const string ManageSalePipelines = nameof(ManageSalePipelines);

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
        // Manage Roles — Admin only
        new("View Roles", SystemAction.View, SystemResource.Roles, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: true),
        new("Create Roles", SystemAction.Create, SystemResource.Roles, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: true),
        new("Update Roles", SystemAction.Update, SystemResource.Roles, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: true),
        new("Delete Role", SystemAction.Delete, SystemResource.Roles, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: true),

        // Manage Users — View on Manager for assign; Create/Update Admin only
        new("View User", SystemAction.View, SystemResource.Users, IsSalesRepresentative: false, IsSalesManager: true, IsRoot: true, IsAdmin: true),
        new("Create User", SystemAction.Create, SystemResource.Users, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: true),
        new("Update User", SystemAction.Update, SystemResource.Users, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: true),

        // Manage Lookup and LookupValues — Admin only
        new("View Lookups and Values", SystemAction.View, SystemResource.ManageLookUps, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: true),
        new("Create Lookup Values", SystemAction.Create, SystemResource.ManageLookUps, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: true),
        new("Update Lookup Values", SystemAction.Update, SystemResource.ManageLookUps, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: true),

        // Manage Settings — Admin only
        new("View Settings", SystemAction.View, SystemResource.ManageSettings, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: true),
        new("Update Settings", SystemAction.Update, SystemResource.ManageSettings, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: true),

        // Email Log — Admin only
        new("View Email Log", SystemAction.View, SystemResource.EmailLog, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: true),

        // Manage Leads (CRM)
        new("View Leads", SystemAction.View, SystemResource.ManageLeads, IsSalesRepresentative: true, IsSalesManager: true, IsRoot: true, IsAdmin: true),
        new("Create Lead", SystemAction.Create, SystemResource.ManageLeads, IsSalesRepresentative: true, IsSalesManager: true, IsRoot: true, IsAdmin: true),
        new("Update Lead", SystemAction.Update, SystemResource.ManageLeads, IsSalesRepresentative: true, IsSalesManager: true, IsRoot: true, IsAdmin: true),
        new("Export Leads", SystemAction.Export, SystemResource.ManageLeads, IsSalesRepresentative: true, IsSalesManager: true, IsRoot: true, IsAdmin: true),

        // Manage Offerings (CRM)
        new("View Offerings", SystemAction.View, SystemResource.ManageOfferings, IsSalesRepresentative: true, IsSalesManager: true, IsRoot: true, IsAdmin: true),
        new("Create Offering", SystemAction.Create, SystemResource.ManageOfferings, IsSalesRepresentative: false, IsSalesManager: true, IsRoot: true, IsAdmin: true),
        new("Update Offering", SystemAction.Update, SystemResource.ManageOfferings, IsSalesRepresentative: false, IsSalesManager: true, IsRoot: true, IsAdmin: true),
        new("Delete Offering", SystemAction.Delete, SystemResource.ManageOfferings, IsSalesRepresentative: false, IsSalesManager: true, IsRoot: true, IsAdmin: true),

        // Lead Calendar (CRM)
        new("View Lead Calendar", SystemAction.View, SystemResource.ManageLeadCalendar, IsSalesRepresentative: true, IsSalesManager: true, IsRoot: true, IsAdmin: true),
        new("View Lead Detail From Calendar", SystemAction.ViewDetail, SystemResource.ManageLeadCalendar, IsSalesRepresentative: true, IsSalesManager: true, IsRoot: true, IsAdmin: true),
        new("View Lead Info From Calendar", SystemAction.ViewInfo, SystemResource.ManageLeadCalendar, IsSalesRepresentative: true, IsSalesManager: true, IsRoot: true, IsAdmin: true),
        new("View Tasks From Calendar", SystemAction.ViewTasks, SystemResource.ManageLeadCalendar, IsSalesRepresentative: true, IsSalesManager: true, IsRoot: true, IsAdmin: true),
        new("Update Lead Calendar", SystemAction.Update, SystemResource.ManageLeadCalendar, IsSalesRepresentative: true, IsSalesManager: true, IsRoot: true, IsAdmin: true),

        // Manage Tasks (CRM)
        new("View Tasks", SystemAction.View, SystemResource.ManageTasks, IsSalesRepresentative: true, IsSalesManager: true, IsRoot: true, IsAdmin: true),
        new("Create Task", SystemAction.Create, SystemResource.ManageTasks, IsSalesRepresentative: true, IsSalesManager: true, IsRoot: true, IsAdmin: true),
        new("Update Task", SystemAction.Update, SystemResource.ManageTasks, IsSalesRepresentative: true, IsSalesManager: true, IsRoot: true, IsAdmin: true),
        new("Delete Task", SystemAction.Delete, SystemResource.ManageTasks, IsSalesRepresentative: false, IsSalesManager: true, IsRoot: true, IsAdmin: true),

        // Manage Lead Visits (CRM)
        new("View Lead Visits", SystemAction.View, SystemResource.ManageLeadVisits, IsSalesRepresentative: true, IsSalesManager: true, IsRoot: true, IsAdmin: true),
        new("Create Lead Visit", SystemAction.Create, SystemResource.ManageLeadVisits, IsSalesRepresentative: true, IsSalesManager: true, IsRoot: true, IsAdmin: true),
        new("Update Lead Visit", SystemAction.Update, SystemResource.ManageLeadVisits, IsSalesRepresentative: true, IsSalesManager: true, IsRoot: true, IsAdmin: true),
        new("Delete Lead Visit", SystemAction.Delete, SystemResource.ManageLeadVisits, IsSalesRepresentative: false, IsSalesManager: true, IsRoot: true, IsAdmin: true),

        // Manage Lead Activities (CRM)
        new("View Lead Activities", SystemAction.View, SystemResource.ManageLeadActivities, IsSalesRepresentative: true, IsSalesManager: true, IsRoot: true, IsAdmin: true),
        new("Create Lead Activity", SystemAction.Create, SystemResource.ManageLeadActivities, IsSalesRepresentative: true, IsSalesManager: true, IsRoot: true, IsAdmin: true),

        // Manage Lead Notes (CRM)
        new("View Lead Notes", SystemAction.View, SystemResource.ManageLeadNotes, IsSalesRepresentative: true, IsSalesManager: true, IsRoot: true, IsAdmin: true),
        new("Create Lead Note", SystemAction.Create, SystemResource.ManageLeadNotes, IsSalesRepresentative: true, IsSalesManager: true, IsRoot: true, IsAdmin: true),

        // Sales Pipeline (CRM)
        new("View Sales Pipeline", SystemAction.View, SystemResource.ManageSalePipelines, IsSalesRepresentative: true, IsSalesManager: true, IsRoot: true, IsAdmin: true),
        new("Create Sales Pipeline Lead", SystemAction.Create, SystemResource.ManageSalePipelines, IsSalesRepresentative: true, IsSalesManager: true, IsRoot: true, IsAdmin: true),
        new("Update Sales Pipeline", SystemAction.Update, SystemResource.ManageSalePipelines, IsSalesRepresentative: true, IsSalesManager: true, IsRoot: true, IsAdmin: true),

        #region Nexus
        new("View Nexus LookUps", SystemAction.View, SystemResource.ManageNexusLookUps, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: false),
        new("Create Nexus LookUps", SystemAction.Create, SystemResource.ManageNexusLookUps, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: false),
        new("Update Nexus LookUps", SystemAction.Update, SystemResource.ManageNexusLookUps, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: false),
        new("Delete Nexus LookUps", SystemAction.Delete, SystemResource.ManageNexusLookUps, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: false),

        new("Create Localization", SystemAction.Create, SystemResource.CountryLocalization, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: false),
        new("Update Localization", SystemAction.Update, SystemResource.CountryLocalization, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: false),
        new("Delete Localization", SystemAction.Delete, SystemResource.CountryLocalization, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: false),
        new("View Localization", SystemAction.View, SystemResource.CountryLocalization, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: false),

        new("View Tenants", SystemAction.View, SystemResource.Tenants, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: false),
        new("Update Tenant", SystemAction.Update, SystemResource.Tenants, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: false),
        #endregion

        #region EmailTemplates
        new("View Email Templates", SystemAction.View, SystemResource.EmailTemplates, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: true),
        new("Create Email Template", SystemAction.Create, SystemResource.EmailTemplates, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: true),
        new("Update Email Template", SystemAction.Update, SystemResource.EmailTemplates, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: true),
        new("Delete Email Template", SystemAction.Delete, SystemResource.EmailTemplates, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: true, IsAdmin: true),
        #endregion

        #region Subscriptions
        new("View My Subscription Details", SystemAction.View, SystemResource.MySubscriptions, IsSalesRepresentative: false, IsSalesManager: false, IsRoot: false, IsAdmin: true),
        #endregion
    };

    public static IReadOnlyList<SystemPermission> All { get; } = new ReadOnlyCollection<SystemPermission>(_all);
    public static IReadOnlyList<SystemPermission> Root { get; } = new ReadOnlyCollection<SystemPermission>(_all.Where(p => p.IsRoot).ToArray());
    public static IReadOnlyList<SystemPermission> Admin { get; } = new ReadOnlyCollection<SystemPermission>(_all.Where(p => p.IsAdmin).ToArray());
    public static IReadOnlyList<SystemPermission> SalesManager { get; } = new ReadOnlyCollection<SystemPermission>(_all.Where(p => p.IsSalesManager).ToArray());
    public static IReadOnlyList<SystemPermission> SalesRepresentative { get; } = new ReadOnlyCollection<SystemPermission>(_all.Where(p => p.IsSalesRepresentative).ToArray());

    /// <summary>Legacy alias for <see cref="SalesRepresentative"/>.</summary>
    public static IReadOnlyList<SystemPermission> Basic => SalesRepresentative;
}

public record SystemPermission(string Description, string Action, string Resource, bool IsSalesRepresentative, bool IsSalesManager, bool IsRoot, bool IsAdmin)
{
    public string Name => NameFor(Action, Resource);
    public static string NameFor(string action, string resource) => $"Permissions.{resource}.{action}";

    /// <summary>Legacy alias used by older call sites / permission UI filters.</summary>
    public bool IsBasic => IsSalesRepresentative;
}
