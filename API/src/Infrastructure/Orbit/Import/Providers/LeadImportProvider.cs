using System.Text.Json;
using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Application.CRM;
using FlowPilot.Application.CRM.Model.Request.Lead;
using FlowPilot.Application.Import.Core;
using FlowPilot.Application.Import.Core.Contracts;
using FlowPilot.Application.Import.Core.Definitions;
using FlowPilot.Application.Nexus.Identity.Users;
using FlowPilot.Domain.CRM;
using FlowPilot.Domain.Enums;
using FlowPilot.Domain.Enums.CRM;
using FlowPilot.Infrastructure.Nexus.Identity.DbModels;
using FlowPilot.Infrastructure.Orbit.Import.Helpers;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Shared.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Orbit.Import.Providers;

public sealed class LeadImportProvider : ImportProviderBase
{
    private const string ExcelImportSourceName = "Excel Import";
    private const string DefaultBusinessType = "Unknown";

    private static readonly JsonSerializerOptions MetadataJsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    private readonly ApplicationDbContext _dbContext;
    private readonly ILeadService _leadService;
    private readonly ICurrentUser _currentUser;
    private readonly IReportingHierarchyService _reportingHierarchyService;
    private readonly UserManager<ApplicationUser> _userManager;

    public LeadImportProvider(
        ApplicationDbContext dbContext,
        ILeadService leadService,
        ICurrentUser currentUser,
        IReportingHierarchyService reportingHierarchyService,
        UserManager<ApplicationUser> userManager)
    {
        _dbContext = dbContext;
        _leadService = leadService;
        _currentUser = currentUser;
        _reportingHierarchyService = reportingHierarchyService;
        _userManager = userManager;
    }

    public override string Key => ImportEntityKeys.Leads;

    public override ImportDefinition GetDefinition() =>
        BuildDefinition(
            Key,
            "Leads",
            "CRM",
            "Import or export leads. Existing mobile or email values are rejected; new rows are inserted only.",
            recommendedOrder: 1,
            SystemResource.ManageLeads,
            Column(ImportColumnKeys.Email, "Email", sample: "jane@example.com", aliases: ["email"]),
            Column(ImportColumnKeys.Name, "Name", sample: "Jane Doe", aliases: ["ownerName", "ownername"]),
            Column(ImportColumnKeys.Title, "Title", sample: "Owner", aliases: ["designation"]),
            Column(ImportColumnKeys.Address, "Address", sample: "12 Market Street", aliases: ["fullAddress", "fulladdress", "address"]),
            Column(ImportColumnKeys.City, "City", sample: "Houston"),
            Column(ImportColumnKeys.State, "State", sample: "TX"),
            Column(ImportColumnKeys.Zip, "Zip", sample: "77001", aliases: ["pincode", "zipcode"]),
            Column(ImportColumnKeys.Zip4, "Zip4", sample: "1234"),
            Column(ImportColumnKeys.Country, "County", sample: "Harris", aliases: ["country", "county"]),
            Column(ImportColumnKeys.FirstName, "First Name", sample: "Jane", aliases: ["firstname", "Firstname"]),
            Column(ImportColumnKeys.LastName, "Last Name", sample: "Doe", aliases: ["lastname", "Lastname"]),
            Column(ImportColumnKeys.ExternalId, "ID", sample: "12345", aliases: ["externalId", "externalid"]),
            Column(ImportColumnKeys.Domain, "Domain", sample: "acme.com", aliases: ["website", "domain"]),
            Column(ImportColumnKeys.Company, "Company", required: true, sample: "Acme Inc", aliases: ["businessName", "businessname", "company"]),
            Column(ImportColumnKeys.Sic4, "SIC4", sample: "5812", aliases: ["sic4"]),
            Column(ImportColumnKeys.Naics6, "NAICS6", sample: "722511", aliases: ["naics6"]),
            Column(ImportColumnKeys.Employee, "Employee", sample: "50", aliases: ["companySize", "companysize", "employee"]),
            Column(ImportColumnKeys.Revenue, "Revenue", dataType: ImportColumnDataType.Number, sample: "250000", aliases: ["expectedRevenue", "expectedrevenue"]),
            Column(ImportColumnKeys.Department, "Department", sample: "Operations"),
            Column(ImportColumnKeys.Level, "Level", sample: "Director"),
            Column(ImportColumnKeys.CompanyPhone, "Company Phone", required: true, sample: "7135550100", aliases: ["mobile", "companyphone", "company_phone", "Company_Phone"]),
            Column(ImportColumnKeys.PublicPrivate, "Public Private", sample: "Private", aliases: ["businessType", "businesstype", "PublicPrivate", "Publicprivate"]),
            Column(ImportColumnKeys.Founded, "Founded", sample: "1998"),
            Column(ImportColumnKeys.LinkedIn, "LinkedIn", sample: "https://linkedin.com/company/acme", aliases: ["Linkedin"]));

    public override async Task<IReadOnlyList<ImportParsedRow>> ParseAsync(
        IReadOnlyList<ImportFileRow> rows,
        CancellationToken cancellationToken)
    {
        var definition = GetDefinition();
        var lookups = await LoadLookupsAsync(cancellationToken);
        var parsed = rows.Select(row => CreateParsedRow(row, definition)).ToList();
        ValidateRows(parsed, lookups);
        return parsed;
    }

    public override async Task<SubmitImportResponse> SubmitAsync(
        IReadOnlyList<ImportParsedRow> rows,
        CancellationToken cancellationToken)
    {
        var definition = GetDefinition();
        var lookups = await LoadLookupsAsync(cancellationToken);
        var parsed = rows.Select(row => CreateParsedRow(row, definition)).ToList();
        ValidateRows(parsed, lookups);

        var response = new SubmitImportResponse();
        foreach (var row in parsed)
        {
            var result = new ImportSubmitRowResult
            {
                RowNumber = row.RowNumber,
                Action = ImportRowAction.Insert
            };

            if (!row.IsValid)
            {
                result.Error = string.Join(" ", row.Errors);
                response.Failed++;
                response.Results.Add(result);
                continue;
            }

            try
            {
                var request = MapCreateRequest(row, lookups);
                await _leadService.CreateAsync(request, cancellationToken);
                RememberInserted(lookups, request);
                result.Success = true;
                response.Inserted++;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Error = ex.Message;
                response.Failed++;
            }

            response.Results.Add(result);
        }

        return response;
    }

    public override async Task<IReadOnlyList<IReadOnlyDictionary<string, string>>> ExportAsync(
        CancellationToken cancellationToken)
    {
        var query = _dbContext.Leads
            .AsNoTracking()
            .Include(x => x.LeadContacts)
            .Where(x => !x.IsArchived);

        if (!await _reportingHierarchyService.IsTenantAdminAsync(cancellationToken))
        {
            var accessibleUserIds = await _reportingHierarchyService.GetAccessibleUserIdsAsync(cancellationToken);
            query = query.Where(x => accessibleUserIds.Contains(x.FKAssignedToUserId));
        }

        var leads = await query
            .OrderByDescending(x => x.CreatedOn)
            .ToListAsync(cancellationToken);

        return leads.Select(MapExportRow).ToList();
    }

    private async Task<LeadImportLookups> LoadLookupsAsync(CancellationToken cancellationToken)
    {
        var sources = await _dbContext.LookUpCodeValues
            .AsNoTracking()
            .Where(x => x.IsActive && x.LookUpCode.LookUpCodeType == LookUpCodeTypes.LeadSource)
            .Select(x => new { x.Id, x.LookUpValue, x.DisplayOrder })
            .ToListAsync(cancellationToken);

        var statuses = await _dbContext.LookUpCodeValues
            .AsNoTracking()
            .Where(x => x.IsActive && x.LookUpCode.LookUpCodeType == LookUpCodeTypes.LeadStatus)
            .Select(x => new { x.Id, x.LookUpValue, x.DisplayOrder })
            .ToListAsync(cancellationToken);

        if (sources.Count == 0)
        {
            throw new NotFoundException("Lead Source lookup values were not found.");
        }

        if (statuses.Count == 0)
        {
            throw new NotFoundException("Lead Status lookup values were not found.");
        }

        var excelImport = sources.FirstOrDefault(x => x.LookUpValue.Equals(ExcelImportSourceName, StringComparison.OrdinalIgnoreCase));
        var defaultSource = excelImport ?? sources.OrderBy(x => x.DisplayOrder).ThenBy(x => x.LookUpValue).First();
        var defaultStatus = statuses
            .OrderBy(x => x.LookUpValue.Equals("New", StringComparison.OrdinalIgnoreCase) ? 0 : 1)
            .ThenBy(x => x.DisplayOrder)
            .First();

        var contacts = await _dbContext.LeadContacts
            .AsNoTracking()
            .Where(x => x.IsPrimary)
            .Select(x => new { x.Mobile, x.Email })
            .ToListAsync(cancellationToken);

        var gstNumbers = await _dbContext.Leads
            .AsNoTracking()
            .Where(x => x.GstNumber != null && x.GstNumber != string.Empty)
            .Select(x => x.GstNumber!)
            .ToListAsync(cancellationToken);

        var tenantId = _currentUser.GetTenant();
        var users = await _userManager.Users
            .AsNoTracking()
            .Where(x => x.FKTenantId == tenantId && x.IsActive)
            .Select(x => new AssignableUser(x.Id, x.Email ?? string.Empty, x.UserName ?? string.Empty, (x.FirstName + " " + x.LastName).Trim()))
            .ToListAsync(cancellationToken);

        var assignable = new List<AssignableUser>();
        foreach (var user in users)
        {
            if (await _reportingHierarchyService.CanWriteAsync(user.Id, cancellationToken))
            {
                assignable.Add(user);
            }
        }

        return new LeadImportLookups
        {
            LeadSourcesByName = sources
                .GroupBy(x => x.LookUpValue, StringComparer.OrdinalIgnoreCase)
                .ToDictionary(g => g.Key, g => g.First().Id, StringComparer.OrdinalIgnoreCase),
            LeadStatusesByName = statuses
                .GroupBy(x => x.LookUpValue, StringComparer.OrdinalIgnoreCase)
                .ToDictionary(g => g.Key, g => g.First().Id, StringComparer.OrdinalIgnoreCase),
            DefaultLeadSourceId = defaultSource.Id,
            DefaultLeadStatusId = defaultStatus.Id,
            Mobiles = contacts
                .Select(x => x.Mobile.Trim())
                .Where(x => x.Length > 0)
                .ToHashSet(StringComparer.OrdinalIgnoreCase),
            Emails = contacts
                .Select(x => x.Email)
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Select(x => x!.Trim())
                .ToHashSet(StringComparer.OrdinalIgnoreCase),
            GstNumbers = gstNumbers
                .Select(x => x.Trim())
                .ToHashSet(StringComparer.OrdinalIgnoreCase),
            Users = assignable
        };
    }

    private void ValidateRows(IReadOnlyList<ImportParsedRow> rows, LeadImportLookups lookups)
    {
        var seenMobiles = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var seenEmails = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var seenGst = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var row in rows)
        {
            var company = GetValue(row, ImportColumnKeys.Company);
            var phone = GetValue(row, ImportColumnKeys.CompanyPhone);
            var ownerName = ResolveOwnerName(row);
            var email = GetValue(row, ImportColumnKeys.Email);
            var gst = GetValue(row, ImportColumnKeys.GstNumber);
            var revenue = GetValue(row, ImportColumnKeys.Revenue);
            var assignedTo = GetValue(row, ImportColumnKeys.AssignedTo);
            var assignToYourselfText = GetValue(row, ImportColumnKeys.AssignToYourself);
            var leadSource = GetValue(row, ImportColumnKeys.LeadSource);
            var leadStatus = GetValue(row, ImportColumnKeys.LeadStatus);
            var priority = GetValue(row, ImportColumnKeys.Priority);
            var interestLevel = GetValue(row, ImportColumnKeys.InterestLevel);
            var closingDate = GetValue(row, ImportColumnKeys.ExpectedClosingDate);

            if (string.IsNullOrWhiteSpace(company))
            {
                AddError(row, "Company is required.");
            }

            if (string.IsNullOrWhiteSpace(phone))
            {
                AddError(row, "Company Phone is required.");
            }
            else if (!ImportValueParser.IsValidMobile(phone))
            {
                AddError(row, "Company Phone is not a valid mobile number.");
            }
            else if (!seenMobiles.Add(phone))
            {
                AddError(row, $"Duplicate Company Phone '{phone}' in file.");
            }
            else if (lookups.Mobiles.Contains(phone))
            {
                AddError(row, $"Mobile '{phone}' already exists.");
            }

            if (string.IsNullOrWhiteSpace(ownerName))
            {
                AddError(row, "Name is required (or Firstname and Lastname).");
            }

            if (!string.IsNullOrWhiteSpace(email))
            {
                if (!ImportValueParser.IsValidEmail(email))
                {
                    AddError(row, "Email is not a valid email address.");
                }
                else if (!seenEmails.Add(email))
                {
                    AddError(row, $"Duplicate Email '{email}' in file.");
                }
                else if (lookups.Emails.Contains(email))
                {
                    AddError(row, $"Email '{email}' already exists.");
                }
            }

            if (!string.IsNullOrWhiteSpace(gst))
            {
                if (!seenGst.Add(gst))
                {
                    AddError(row, $"Duplicate GstNumber '{gst}' in file.");
                }
                else if (lookups.GstNumbers.Contains(gst))
                {
                    AddError(row, $"GST Number '{gst}' already exists.");
                }
            }

            if (!string.IsNullOrWhiteSpace(revenue) && !ImportValueParser.TryParseDecimal(revenue, out _))
            {
                // Invalid revenue is stored in Metadata as rawRevenue; do not fail the row.
            }

            if (!string.IsNullOrWhiteSpace(leadSource) && !lookups.LeadSourcesByName.ContainsKey(leadSource))
            {
                AddError(row, $"Lead Source '{leadSource}' does not exist.");
            }

            if (!string.IsNullOrWhiteSpace(leadStatus) && !lookups.LeadStatusesByName.ContainsKey(leadStatus))
            {
                AddError(row, $"Lead Status '{leadStatus}' does not exist.");
            }

            if (!string.IsNullOrWhiteSpace(priority) && !ImportValueParser.TryParseEnum<LeadPriority>(priority, out _))
            {
                AddError(row, $"Priority '{priority}' is not valid.");
            }

            if (!string.IsNullOrWhiteSpace(interestLevel) && !ImportValueParser.TryParseEnum<InterestLevel>(interestLevel, out _))
            {
                AddError(row, $"InterestLevel '{interestLevel}' is not valid.");
            }

            if (!string.IsNullOrWhiteSpace(closingDate) && !ImportValueParser.TryParseDate(closingDate, out _))
            {
                AddError(row, "ExpectedClosingDate must be a valid date.");
            }

            if (!string.IsNullOrWhiteSpace(assignToYourselfText) && !ImportValueParser.TryParseBool(assignToYourselfText, out _))
            {
                AddError(row, "AssignToYourself must be Yes or No.");
            }

            var assignToYourself = ResolveAssignToYourself(assignToYourselfText, assignedTo);
            if (!assignToYourself && !string.IsNullOrWhiteSpace(assignedTo) && FindAssignableUser(lookups, assignedTo) is null)
            {
                AddError(row, $"AssignedTo '{assignedTo}' was not found or you cannot assign to that user.");
            }

            if (!assignToYourself && string.IsNullOrWhiteSpace(assignedTo))
            {
                AddError(row, "AssignedTo is required when AssignToYourself is No.");
            }

            row.Action = ImportRowAction.Insert;
            FinalizeRow(row);
        }
    }

    private CreateLeadRequest MapCreateRequest(ImportParsedRow row, LeadImportLookups lookups)
    {
        var revenueText = GetValue(row, ImportColumnKeys.Revenue);
        decimal? revenue = null;
        var revenueParsed = ImportValueParser.TryParseDecimal(revenueText, out var parsedRevenue);
        if (revenueParsed)
        {
            revenue = parsedRevenue;
        }

        var assignedTo = GetValue(row, ImportColumnKeys.AssignedTo);
        var assignToYourself = ResolveAssignToYourself(GetValue(row, ImportColumnKeys.AssignToYourself), assignedTo);
        string? assignedToUserId = null;
        if (!assignToYourself)
        {
            assignedToUserId = FindAssignableUser(lookups, assignedTo)?.Id;
        }

        var leadSourceText = GetValue(row, ImportColumnKeys.LeadSource);
        var leadSourceId = string.IsNullOrWhiteSpace(leadSourceText)
            ? lookups.DefaultLeadSourceId
            : lookups.LeadSourcesByName[leadSourceText];

        DefaultIdType? leadStatusId = null;
        var leadStatusText = GetValue(row, ImportColumnKeys.LeadStatus);
        if (!string.IsNullOrWhiteSpace(leadStatusText))
        {
            leadStatusId = lookups.LeadStatusesByName[leadStatusText];
        }

        var hasPriority = ImportValueParser.TryParseEnum<LeadPriority>(GetValue(row, ImportColumnKeys.Priority), out var priority);
        var hasInterest = ImportValueParser.TryParseEnum<InterestLevel>(GetValue(row, ImportColumnKeys.InterestLevel), out var interestLevel);
        DateTimeOffset? closingDate = null;
        if (ImportValueParser.TryParseDate(GetValue(row, ImportColumnKeys.ExpectedClosingDate), out var parsedDate))
        {
            closingDate = parsedDate;
        }

        var businessType = ImportValueParser.NullIfEmpty(GetValue(row, ImportColumnKeys.PublicPrivate)) ?? DefaultBusinessType;

        return new CreateLeadRequest
        {
            BusinessName = GetValue(row, ImportColumnKeys.Company),
            BusinessType = businessType,
            Website = ImportValueParser.NullIfEmpty(GetValue(row, ImportColumnKeys.Domain)),
            GstNumber = ImportValueParser.NullIfEmpty(GetValue(row, ImportColumnKeys.GstNumber)),
            ExpectedRevenue = revenue,
            CompanySize = ImportValueParser.NullIfEmpty(GetValue(row, ImportColumnKeys.Employee)),
            OwnerName = ResolveOwnerName(row),
            Designation = ImportValueParser.NullIfEmpty(GetValue(row, ImportColumnKeys.Title)),
            Mobile = GetValue(row, ImportColumnKeys.CompanyPhone),
            WhatsApp = ImportValueParser.NullIfEmpty(GetValue(row, ImportColumnKeys.WhatsApp)),
            Email = ImportValueParser.NullIfEmpty(GetValue(row, ImportColumnKeys.Email)),
            AlternatePhone = ImportValueParser.NullIfEmpty(GetValue(row, ImportColumnKeys.AlternatePhone)),
            Country = ImportValueParser.NullIfEmpty(GetValue(row, ImportColumnKeys.Country)),
            State = ImportValueParser.NullIfEmpty(GetValue(row, ImportColumnKeys.State)),
            City = ImportValueParser.NullIfEmpty(GetValue(row, ImportColumnKeys.City)),
            Area = ImportValueParser.NullIfEmpty(GetValue(row, ImportColumnKeys.Area)),
            Pincode = ImportValueParser.NullIfEmpty(GetValue(row, ImportColumnKeys.Zip)),
            FullAddress = ImportValueParser.NullIfEmpty(GetValue(row, ImportColumnKeys.Address)),
            LeadSourceId = leadSourceId,
            AssignToYourself = assignToYourself,
            AssignedToUserId = assignedToUserId,
            Priority = hasPriority ? priority : LeadPriority.Medium,
            LeadStatusId = leadStatusId ?? lookups.DefaultLeadStatusId,
            ExpectedClosingDate = closingDate,
            InterestLevel = hasInterest ? interestLevel : InterestLevel.Medium,
            Notes = ImportValueParser.NullIfEmpty(GetValue(row, ImportColumnKeys.Notes)),
            PainPoints = ImportValueParser.NullIfEmpty(GetValue(row, ImportColumnKeys.PainPoints)),
            Competitors = ImportValueParser.NullIfEmpty(GetValue(row, ImportColumnKeys.Competitors)),
            Requirements = ImportValueParser.NullIfEmpty(GetValue(row, ImportColumnKeys.Requirements)),
            Metadata = BuildMetadataJson(row, revenueText, revenueParsed),
            OfferingId = 1,
        };
    }

    private static IReadOnlyDictionary<string, string> MapExportRow(Leads lead)
    {
        var contact = lead.LeadContacts.FirstOrDefault(c => c.IsPrimary);
        var metadata = ParseMetadata(lead.Metadata);

        string Meta(string key) =>
            metadata.TryGetValue(key, out var value) ? value : string.Empty;

        return new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            [ImportColumnKeys.Email] = contact?.Email ?? string.Empty,
            [ImportColumnKeys.Name] = contact?.OwnerName ?? string.Empty,
            [ImportColumnKeys.Title] = contact?.Designation ?? string.Empty,
            [ImportColumnKeys.Address] = lead.FullAddress ?? string.Empty,
            [ImportColumnKeys.City] = lead.City ?? string.Empty,
            [ImportColumnKeys.State] = lead.State ?? string.Empty,
            [ImportColumnKeys.Zip] = lead.Pincode ?? string.Empty,
            [ImportColumnKeys.Zip4] = Meta("zip4"),
            [ImportColumnKeys.Country] = lead.Country ?? string.Empty,
            [ImportColumnKeys.FirstName] = Meta("firstname"),
            [ImportColumnKeys.LastName] = Meta("lastname"),
            [ImportColumnKeys.ExternalId] = Meta("externalId"),
            [ImportColumnKeys.Domain] = lead.Website ?? string.Empty,
            [ImportColumnKeys.Company] = lead.BusinessName,
            [ImportColumnKeys.Sic4] = Meta("sic4"),
            [ImportColumnKeys.Naics6] = Meta("naics6"),
            [ImportColumnKeys.Employee] = lead.CompanySize ?? string.Empty,
            [ImportColumnKeys.Revenue] = ImportValueParser.FormatDecimal(lead.ExpectedRevenue),
            [ImportColumnKeys.Department] = Meta("department"),
            [ImportColumnKeys.Level] = Meta("level"),
            [ImportColumnKeys.CompanyPhone] = contact?.Mobile ?? string.Empty,
            [ImportColumnKeys.PublicPrivate] = lead.BusinessType,
            [ImportColumnKeys.Founded] = Meta("founded"),
            [ImportColumnKeys.LinkedIn] = Meta("linkedIn")
        };
    }

    private string ResolveOwnerName(ImportParsedRow row)
    {
        var name = GetValue(row, ImportColumnKeys.Name);
        if (!string.IsNullOrWhiteSpace(name))
        {
            return name;
        }

        var first = GetValue(row, ImportColumnKeys.FirstName);
        var last = GetValue(row, ImportColumnKeys.LastName);
        return string.Join(' ', new[] { first, last }.Where(x => !string.IsNullOrWhiteSpace(x))).Trim();
    }

    private static bool ResolveAssignToYourself(string assignToYourselfText, string assignedTo)
    {
        if (ImportValueParser.TryParseBool(assignToYourselfText, out var parsed))
        {
            return parsed;
        }

        return string.IsNullOrWhiteSpace(assignedTo);
    }

    private static AssignableUser? FindAssignableUser(LeadImportLookups lookups, string assignedTo)
    {
        return lookups.Users.FirstOrDefault(user =>
            user.Email.Equals(assignedTo, StringComparison.OrdinalIgnoreCase)
            || user.UserName.Equals(assignedTo, StringComparison.OrdinalIgnoreCase)
            || user.FullName.Equals(assignedTo, StringComparison.OrdinalIgnoreCase)
            || user.Id.Equals(assignedTo, StringComparison.OrdinalIgnoreCase));
    }

    private static string? BuildMetadataJson(ImportParsedRow row, string revenueText, bool revenueParsed)
    {
        var metadata = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        AddMetadata(metadata, "zip4", GetValue(row, ImportColumnKeys.Zip4));
        AddMetadata(metadata, "firstname", GetValue(row, ImportColumnKeys.FirstName));
        AddMetadata(metadata, "lastname", GetValue(row, ImportColumnKeys.LastName));
        AddMetadata(metadata, "externalId", GetValue(row, ImportColumnKeys.ExternalId));
        AddMetadata(metadata, "sic4", GetValue(row, ImportColumnKeys.Sic4));
        AddMetadata(metadata, "naics6", GetValue(row, ImportColumnKeys.Naics6));
        AddMetadata(metadata, "department", GetValue(row, ImportColumnKeys.Department));
        AddMetadata(metadata, "level", GetValue(row, ImportColumnKeys.Level));
        AddMetadata(metadata, "founded", GetValue(row, ImportColumnKeys.Founded));
        AddMetadata(metadata, "linkedIn", GetValue(row, ImportColumnKeys.LinkedIn));
        if (!string.IsNullOrWhiteSpace(revenueText) && !revenueParsed)
        {
            AddMetadata(metadata, "rawRevenue", revenueText);
        }

        return metadata.Count == 0 ? null : JsonSerializer.Serialize(metadata, MetadataJsonOptions);
    }

    private static void AddMetadata(IDictionary<string, string> metadata, string key, string value)
    {
        if (!string.IsNullOrWhiteSpace(value))
        {
            metadata[key] = value.Trim();
        }
    }

    private static Dictionary<string, string> ParseMetadata(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        }

        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, string>>(json, MetadataJsonOptions)
                ?? new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        }
        catch (JsonException)
        {
            return new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        }
    }

    private static void RememberInserted(LeadImportLookups lookups, CreateLeadRequest request)
    {
        lookups.Mobiles.Add(request.Mobile);
        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            lookups.Emails.Add(request.Email);
        }

        if (!string.IsNullOrWhiteSpace(request.GstNumber))
        {
            lookups.GstNumbers.Add(request.GstNumber);
        }
    }

    private sealed class LeadImportLookups
    {
        public Dictionary<string, DefaultIdType> LeadSourcesByName { get; init; } = new(StringComparer.OrdinalIgnoreCase);

        public Dictionary<string, DefaultIdType> LeadStatusesByName { get; init; } = new(StringComparer.OrdinalIgnoreCase);

        public DefaultIdType DefaultLeadSourceId { get; init; }

        public DefaultIdType DefaultLeadStatusId { get; init; }

        public HashSet<string> Mobiles { get; init; } = new(StringComparer.OrdinalIgnoreCase);

        public HashSet<string> Emails { get; init; } = new(StringComparer.OrdinalIgnoreCase);

        public HashSet<string> GstNumbers { get; init; } = new(StringComparer.OrdinalIgnoreCase);

        public List<AssignableUser> Users { get; init; } = [];
    }

    private sealed record AssignableUser(string Id, string Email, string UserName, string FullName);
}
