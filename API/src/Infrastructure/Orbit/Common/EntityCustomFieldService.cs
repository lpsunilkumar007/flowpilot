using FlowPilot.Application.Common.CustomFields;
using FlowPilot.Application.Common.CustomFields.Model.Request;
using FlowPilot.Application.Common.CustomFields.Model.Response;
using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Domain.Common;
using FlowPilot.Domain.Enums.Common;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Infrastructure.SystemConstants;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Orbit.Common;

public class EntityCustomFieldService : IEntityCustomFieldService
{
    public const int MaxFieldsPerEntity = 20;
    public const int MaxLabelLength = 100;
    public const int MaxValueLength = 500;

    private readonly ApplicationDbContext _db;

    public EntityCustomFieldService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<ViewEntityCustomFieldResponse>> GetByEntityAsync(
        EntityCustomFieldType entityType,
        DefaultIdType entityId,
        CancellationToken cancellationToken = default)
    {
        if (entityId <= 0)
        {
            throw new BadRequestException(string.Format(ErrorMessages.ItemNotFound, "Entity"));
        }

        await EnsureParentExistsAsync(entityType, entityId, cancellationToken);

        var fields = await _db.EntityCustomFields
            .AsNoTracking()
            .Where(x => x.EntityType == entityType && x.FKEntityPKId == entityId)
            .OrderBy(x => x.DisplayOrder)
            .ThenBy(x => x.Id)
            .ToListAsync(cancellationToken);

        return fields.Adapt<List<ViewEntityCustomFieldResponse>>();
    }

    public async Task<string> ReplaceForEntityAsync(
        ReplaceEntityCustomFieldsRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureParentExistsAsync(request.EntityType, request.EntityId, cancellationToken);

        var incoming = NormalizeFields(request.Fields);
        ValidateFields(incoming);

        var existing = await _db.EntityCustomFields
            .Where(x => x.EntityType == request.EntityType && x.FKEntityPKId == request.EntityId)
            .ToListAsync(cancellationToken);

        var incomingIds = incoming
            .Where(x => x.Id.GetValueOrDefault() > 0)
            .Select(x => x.Id!.Value)
            .ToHashSet();

        var toRemove = existing.Where(x => !incomingIds.Contains(x.Id)).ToList();
        if (toRemove.Count > 0)
        {
            _db.EntityCustomFields.RemoveRange(toRemove);
        }

        foreach (var field in incoming)
        {
            var existingField = field.Id.GetValueOrDefault() > 0
                ? existing.FirstOrDefault(x => x.Id == field.Id)
                : null;

            if (existingField is not null)
            {
                existingField.Label = field.Label!;
                existingField.Value = field.Value!;
                existingField.DisplayOrder = field.DisplayOrder;
            }
            else
            {
                await _db.EntityCustomFields.AddAsync(
                    new EntityCustomFields
                    {
                        EntityType = request.EntityType,
                        FKEntityPKId = request.EntityId,
                        Label = field.Label!,
                        Value = field.Value!,
                        DisplayOrder = field.DisplayOrder,
                    },
                    cancellationToken);
            }
        }

        await _db.SaveChangesAsync(cancellationToken);
        return SuccessMessages.RecordUpdatedSuccessfully;
    }

    private async Task EnsureParentExistsAsync(
        EntityCustomFieldType entityType,
        DefaultIdType entityId,
        CancellationToken cancellationToken)
    {
        var exists = entityType switch
        {
            EntityCustomFieldType.Lead => await _db.Leads.AnyAsync(x => x.Id == entityId, cancellationToken),
            EntityCustomFieldType.Task => await _db.Tasks.AnyAsync(x => x.Id == entityId, cancellationToken),
            _ => throw new BadRequestException(ErrorMessages.UnsupportedCustomFieldEntityType),
        };

        if (!exists)
        {
            var name = entityType == EntityCustomFieldType.Lead ? "Lead" : "Task";
            throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, name));
        }
    }

    private static List<EntityCustomFieldItemRequest> NormalizeFields(IEnumerable<EntityCustomFieldItemRequest>? fields)
    {
        var normalized = new List<EntityCustomFieldItemRequest>();
        var displayOrder = 0;

        foreach (var field in fields ?? Enumerable.Empty<EntityCustomFieldItemRequest>())
        {
            var label = field.Label?.Trim() ?? string.Empty;
            var value = field.Value?.Trim() ?? string.Empty;
            if (label.Length == 0 && value.Length == 0)
            {
                continue;
            }

            normalized.Add(new EntityCustomFieldItemRequest
            {
                Id = field.Id,
                Label = label,
                Value = value,
                DisplayOrder = displayOrder++,
            });
        }

        return normalized;
    }

    private static void ValidateFields(List<EntityCustomFieldItemRequest> fields)
    {
        if (fields.Count > MaxFieldsPerEntity)
        {
            throw new BadRequestException(string.Format(ErrorMessages.CustomFieldLimitExceeded, MaxFieldsPerEntity));
        }

        foreach (var field in fields)
        {
            if (string.IsNullOrWhiteSpace(field.Label) || string.IsNullOrWhiteSpace(field.Value))
            {
                throw new BadRequestException(ErrorMessages.CustomFieldLabelAndValueRequired);
            }

            if (field.Label!.Length > MaxLabelLength)
            {
                throw new BadRequestException(string.Format(ErrorMessages.CustomFieldLabelTooLong, MaxLabelLength));
            }

            if (field.Value!.Length > MaxValueLength)
            {
                throw new BadRequestException(string.Format(ErrorMessages.CustomFieldValueTooLong, MaxValueLength));
            }
        }

        var duplicate = fields
            .GroupBy(x => x.Label!, StringComparer.OrdinalIgnoreCase)
            .FirstOrDefault(g => g.Count() > 1);

        if (duplicate is not null)
        {
            throw new BadRequestException(ErrorMessages.DuplicateCustomFieldLabels);
        }
    }
}
