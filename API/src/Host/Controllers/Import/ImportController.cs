using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Import;
using FlowPilot.Application.Import.Core.Contracts;
using FlowPilot.Host.Controllers.BaseControllers;

namespace FlowPilot.Host.Controllers.Import;

public class ImportController : VersionedApiController
{
    private readonly IImportService _importService;

    public ImportController(IImportService importService)
    {
        _importService = importService;
    }

    [HttpGet("definitions")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageLeads)]
    [OpenApiOperation("Get import entity definitions", "Returns metadata and columns for registered import/export providers.")]
    public Task<IReadOnlyList<Application.Import.Core.Definitions.ImportDefinition>> GetDefinitions(CancellationToken cancellationToken)
    {
        return _importService.GetDefinitionsAsync(cancellationToken);
    }

    [HttpGet("{entityKey}/template")]
    [MustHavePermission(SystemAction.View, SystemResource.ManageLeads)]
    [OpenApiOperation("Download CSV template", "Downloads an empty CSV template for the selected entity.")]
    public async Task<IActionResult> DownloadTemplate(string entityKey, CancellationToken cancellationToken)
    {
        var file = await _importService.GetTemplateAsync(entityKey, cancellationToken);
        return File(file.Content, file.ContentType, file.FileName);
    }

    [HttpGet("{entityKey}/export")]
    [MustHavePermission(SystemAction.Export, SystemResource.ManageLeads)]
    [OpenApiOperation("Export entity CSV", "Exports tenant-scoped rows using the same columns as the import template.")]
    public async Task<IActionResult> Export(string entityKey, CancellationToken cancellationToken)
    {
        var file = await _importService.ExportAsync(entityKey, cancellationToken);
        return File(file.Content, file.ContentType, file.FileName);
    }

    [HttpPost("{entityKey}/parse")]
    [Consumes("multipart/form-data")]
    [MustHavePermission(SystemAction.Create, SystemResource.ManageLeads)]
    [OpenApiOperation("Parse import CSV", "Parses and validates a CSV file without persisting rows.")]
    public async Task<ParseImportResponse> Parse(string entityKey, [FromForm] ParseImportFormRequest request, CancellationToken cancellationToken)
    {
        if (request.File == null || request.File.Length == 0)
        {
            throw new ValidationException("No file selected.");
        }

        await using var stream = request.File.OpenReadStream();
        return await _importService.ParseAsync(entityKey, stream, request.File.FileName, cancellationToken);
    }

    [HttpPost("{entityKey}/submit")]
    [MustHavePermission(SystemAction.Create, SystemResource.ManageLeads)]
    [OpenApiOperation("Submit parsed import rows", "Persists previously parsed and edited CSV rows.")]
    public Task<SubmitImportResponse> Submit(string entityKey, [FromBody] SubmitImportRequest request, CancellationToken cancellationToken)
    {
        return _importService.SubmitAsync(entityKey, request, cancellationToken);
    }

    public class ParseImportFormRequest
    {
        public IFormFile? File { get; set; }
    }
}
