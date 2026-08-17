using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Application.Import;
using FlowPilot.Application.Import.Core;
using FlowPilot.Application.Import.Core.Contracts;
using FlowPilot.Application.Import.Core.Definitions;
using FlowPilot.Application.Nexus.Identity.Users;
using FlowPilot.Shared.Authorization;

namespace FlowPilot.Infrastructure.Orbit.Import;

public sealed class ImportService : IImportService
{
    public const int MaxImportRows = 2000;

    private readonly IImportRegistry _registry;
    private readonly IImportFileReader _fileReader;
    private readonly IImportFileWriter _fileWriter;
    private readonly ICurrentUser _currentUser;
    private readonly IUserService _userService;

    public ImportService(
        IImportRegistry registry,
        IImportFileReader fileReader,
        IImportFileWriter fileWriter,
        ICurrentUser currentUser,
        IUserService userService)
    {
        _registry = registry;
        _fileReader = fileReader;
        _fileWriter = fileWriter;
        _currentUser = currentUser;
        _userService = userService;
    }

    public async Task<IReadOnlyList<ImportDefinition>> GetDefinitionsAsync(CancellationToken cancellationToken)
    {
        var definitions = new List<ImportDefinition>();
        foreach (var definition in _registry.GetDefinitions())
        {
            if (await CanAccessProviderAsync(definition.EntityResource, SystemAction.View, cancellationToken)
                || await CanAccessProviderAsync(definition.EntityResource, SystemAction.Create, cancellationToken))
            {
                definitions.Add(definition);
            }
        }

        return definitions;
    }

    public async Task<ImportFile> GetTemplateAsync(string entityKey, CancellationToken cancellationToken)
    {
        var provider = await GetAuthorizedProviderAsync(entityKey, SystemAction.View, cancellationToken);
        var definition = provider.GetDefinition();
        var sample = definition.Columns.ToDictionary(
            column => column.Key,
            column => column.Sample ?? string.Empty,
            StringComparer.OrdinalIgnoreCase);

        return new ImportFile
        {
            Content = _fileWriter.Write(definition.Columns, [sample]),
            ContentType = "text/csv",
            FileName = $"{definition.Key}-template.csv"
        };
    }

    public async Task<ParseImportResponse> ParseAsync(
        string entityKey,
        Stream stream,
        string fileName,
        CancellationToken cancellationToken)
    {
        var provider = await GetAuthorizedProviderAsync(entityKey, SystemAction.Create, cancellationToken);
        var fileRows = await _fileReader.ReadAsync(stream, fileName, cancellationToken);

        if (fileRows.Count > MaxImportRows)
        {
            throw new ValidationException($"A maximum of {MaxImportRows} data rows can be imported at once.");
        }

        var parsedRows = await provider.ParseAsync(fileRows, cancellationToken);
        return new ParseImportResponse
        {
            Rows = parsedRows.ToList(),
            TotalRows = parsedRows.Count,
            ValidRows = parsedRows.Count(x => x.IsValid),
            InvalidRows = parsedRows.Count(x => !x.IsValid)
        };
    }

    public async Task<SubmitImportResponse> SubmitAsync(
        string entityKey,
        SubmitImportRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Rows == null || request.Rows.Count == 0)
        {
            throw new ValidationException("No import rows found.");
        }

        if (request.Rows.Count > MaxImportRows)
        {
            throw new ValidationException($"A maximum of {MaxImportRows} data rows can be imported at once.");
        }

        var provider = await GetAuthorizedProviderAsync(entityKey, SystemAction.Create, cancellationToken);
        return await provider.SubmitAsync(request.Rows, cancellationToken);
    }

    public async Task<ImportFile> ExportAsync(string entityKey, CancellationToken cancellationToken)
    {
        var provider = await GetAuthorizedProviderAsync(entityKey, SystemAction.View, cancellationToken);
        var definition = provider.GetDefinition();
        var rows = await provider.ExportAsync(cancellationToken);

        return new ImportFile
        {
            Content = _fileWriter.Write(definition.Columns, rows),
            ContentType = "text/csv",
            FileName = $"{definition.Key}-{DateTime.UtcNow:yyyyMMddHHmmss}.csv"
        };
    }

    private async Task<IImportProvider> GetAuthorizedProviderAsync(
        string entityKey,
        string entityAction,
        CancellationToken cancellationToken)
    {
        var provider = _registry.Get(entityKey);
        var definition = provider.GetDefinition();
        if (!await CanAccessProviderAsync(definition.EntityResource, entityAction, cancellationToken))
        {
            throw new ForbiddenException($"You do not have permission to {entityAction.ToLowerInvariant()} {definition.Name}.");
        }

        return provider;
    }

    private async Task<bool> CanAccessProviderAsync(string entityResource, string action, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated() || string.IsNullOrWhiteSpace(entityResource))
        {
            return false;
        }

        var userId = _currentUser.GetUserId().ToString();
        return await _userService.HasPermissionAsync(userId, action, entityResource, cancellationToken);
    }
}
