using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Interfaces;
using FlowPilot.Application.FormDesigner;
using FlowPilot.Application.FormDesigner.Model.Request.FormPageFields;
using FlowPilot.Application.FormDesigner.Model.Request.FormPageFields.FormPageFieldTypeModels;
using FlowPilot.Domain.Enums.FormDesigner;
using FlowPilot.Domain.FormDesigner;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Infrastructure.SystemConstants;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Orbit.FormDesigner;
public class FormPageFieldService : IFormPageFieldService
{
    private readonly ApplicationDbContext _applicationDbContext;

    public FormPageFieldService(ApplicationDbContext applicationDbContext)
    {
        _applicationDbContext = applicationDbContext;
    }

    public T GetCreateFormPageFieldRequest<T>(GetFormPageFieldModelsRequest request, FormPageFields? entity = null)
    {
        switch (request.FormPageFieldType)
        {
            case FormPageFieldTypes.Number:
                return (T)(object)new CreateFormPageFieldNumberRequest
                {
                    Id = entity?.Id ?? 0,
                    FKFormPagePKId = entity?.FKFormPagePKId ?? request.FKFormPagePKId,
                    FKFormPageFieldTabId = entity?.FKFormPageFieldTabId ?? request.FKFormPageFieldTabId,
                    Label = entity?.Label ?? string.Empty,
                    DisplayOrder = entity?.DisplayOrder ?? 0,
                    FieldKey = entity?.FieldKey ?? Guid.NewGuid(),
                };
            case FormPageFieldTypes.Select:
                return (T)(object)new CreateFormPageFieldSelectRequest
                {
                    Id = entity?.Id ?? 0,
                    FKFormPagePKId = entity?.FKFormPagePKId ?? request.FKFormPagePKId,
                    FKFormPageFieldTabId = entity?.FKFormPageFieldTabId ?? request.FKFormPageFieldTabId,
                    Label = entity?.Label ?? string.Empty,
                    DisplayOrder = entity?.DisplayOrder ?? 0,
                    FieldKey = entity?.FieldKey ?? Guid.NewGuid(),
                    IsAdditionalCommentAllowed = entity?.IsAdditionalCommentAllowed ?? false,
                    Options = ConvertFieldOptions(entity?.FormPageFieldOptions, entity?.Id ?? 0, request.FormPageFieldType),
                };
            default:
                throw new CustomNotImplementedException(string.Format(ErrorMessages.NotImplementedItem, request.FormPageFieldType.ToString()));
        }
    }

    public async Task<T> CreateUpdateFormPageFieldAsync<T>(T deserializedModel, DefaultIdType id)
    {
        FormPageFields? entity = null;
        DefaultIdType fieldId = id;
        if (deserializedModel is FormPageFieldTypeBase generalProperties)
        {
            if (id == 0)
            {
                entity = new FormPageFields
                {
                    FormPageFieldType = generalProperties.FormPageFieldType,
                    FKFormPagePKId = generalProperties.FKFormPagePKId,
                    FKFormPageFieldTabId = generalProperties.FKFormPageFieldTabId,
                    Label = generalProperties.Label,
                    FieldKey = generalProperties.FieldKey,
                    DisplayOrder = generalProperties.DisplayOrder,
                    IsAdditionalCommentAllowed = false,
                };
            }
            else
            {
                entity = await _applicationDbContext.FormPageFields.Include(x => x.FormPageFieldOptions).SingleOrDefaultAsync(x => x.Id == id);
                _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "FormPageField"));

                entity.Label = generalProperties.Label;
                entity.DisplayOrder = generalProperties.DisplayOrder;
            }
        }

        if (deserializedModel is CreateFormPageFieldNumberRequest numberRequest)
        {

        }
        else if (deserializedModel is CreateFormPageFieldSelectRequest fieldSelectRequest)
        {
            if (fieldSelectRequest.Options == null || fieldSelectRequest.Options.Count == 0) { throw new BadRequestException(ErrorMessages.OptionsRequired); }

            entity.FormPageFieldOptions = CreateUpdateFormFieldOptions(entity.FormPageFieldOptions, fieldSelectRequest.Options);
            entity.IsAdditionalCommentAllowed = fieldSelectRequest.IsAdditionalCommentAllowed;
        }
        else
        {
            throw new CustomNotImplementedException(string.Format(ErrorMessages.NotImplementedItem));
        }

        if (entity != null)
        {
            if (id == 0)
            {
                await _applicationDbContext.FormPageFields.AddAsync(entity);
            }
            else
            {
                _applicationDbContext.FormPageFields.Update(entity);
            }

            await _applicationDbContext.SaveChangesAsync();

            fieldId = entity.Id;
        }
        else
        {
            throw new CustomNotImplementedException(string.Format(ErrorMessages.NotImplementedItem));
        }

        return await GetFormPageFieldDetailByIdAsync<T>(fieldId);
    }

    private List<FormPageFieldOptions> CreateUpdateFormFieldOptions(List<FormPageFieldOptions> existingOptions, List<CreateFormPageFieldOptionsRequest> updatedOptions)
    {
        // Get a list of existing option IDs from the request
        var requestOptionIds = updatedOptions.Select(x => x.Id).ToHashSet();

        // Remove Deleted Options
        foreach (var option in existingOptions)
        {
            if (!requestOptionIds.Contains(option.Id))
            {
                option.IsDeleted = true;
            }
        }

        // Update Existing Options and Add New Options if necessary
        foreach (var requestOption in updatedOptions)
        {
            var existingOption = existingOptions.FirstOrDefault(x => x.Id == requestOption.Id);

            if (existingOption != null)
            {
                // Update Existing Option
                existingOption.Value = requestOption.Value;
                existingOption.Text = string.IsNullOrEmpty(requestOption.Text) ? existingOption.Text : requestOption.Text;
                existingOption.IsActive = requestOption.IsActive;
                existingOption.IsDeleted = requestOption.IsDeleted;
                existingOption.DisplayOrder = requestOption.DisplayOrder;
            }
            else
            {
                if (requestOption.IsDeleted || string.IsNullOrEmpty(requestOption.Text))
                {
                    continue;
                }

                // Add New Option
                existingOptions.Add(new FormPageFieldOptions()
                {
                    Value = requestOption.Value,
                    Text = requestOption.Text,
                    DisplayOrder = requestOption.DisplayOrder,
                    IsActive = requestOption.IsActive,
                });
            }
        }

        // Return Updated Existing Options
        return existingOptions;
    }

    private List<CreateFormPageFieldOptionsRequest> ConvertFieldOptions(ICollection<FormPageFieldOptions>? formPageFieldOptions, DefaultIdType id, FormPageFieldTypes formPageFieldType)
    {
        List<CreateFormPageFieldOptionsRequest> result = [];
        if (formPageFieldOptions != null)
        {
            return formPageFieldOptions.Select(x => new CreateFormPageFieldOptionsRequest()
            {
                Id = x.Id,
                Text = x.Text,
                Value = x.Value,
                IsActive = x.IsActive,
                DisplayOrder = x.DisplayOrder,
            }).ToList();
        }

        if (id <= 0)
        {
            string prefixText = "Option ";

            switch (formPageFieldType)
            {
                default:
                    for (int i = 1; i <= 5; i++)
                    {
                        result.Add(new CreateFormPageFieldOptionsRequest
                        {
                            Text = $"{prefixText}{i}",
                            Value = $"{prefixText}{i}",
                            IsActive = true,
                            DisplayOrder = i,
                        });
                    }
                    break;
            }
        }

        return result;
    }

    public async Task<T> GetFormPageFieldDetailByIdAsync<T>(DefaultIdType id)
    {
        var result = await _applicationDbContext.FormPageFields.Include(x => x.FormPageFieldOptions).SingleOrDefaultAsync(x => x.Id == id);
        _ = result ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "item"));

        return GetCreateFormPageFieldRequest<T>(
            new GetFormPageFieldModelsRequest
            {
                FKFormPagePKId = result.FKFormPagePKId,
                FKFormPageFieldTabId = result.FKFormPageFieldTabId,
                FormPageFieldType = result.FormPageFieldType,
            }, result);
    }

    public async Task<string> DeleteFormPageField(DefaultIdType id)
    {
        var entity = await _applicationDbContext.FormPageFields.SingleOrDefaultAsync(x => x.Id == id);
        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "Item"));

        entity.IsDeleted = true;
        _applicationDbContext.FormPageFields.Update(entity).State = EntityState.Deleted;
        await _applicationDbContext.SaveChangesAsync();

        return string.Format(SuccessMessages.RecordDeletedSuccessfully, entity.Label);
    }
}
