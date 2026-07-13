using System.Linq.Expressions;
using FlowPilot.Application.Common.Models;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Persistence.Context;
public static class QueryableExtensions
{
    public static async Task<PaginationResponse<TDestination>> PaginatedListAsync<T, TDestination>(
        this IQueryable<T> query, int pageNumber, int pageSize)
    {
        var totalCount = await query.CountAsync();

        // Ensure valid page size and page number
        pageNumber = pageNumber <= 0 ? 1 : pageNumber;
        pageSize = pageSize <= 0 ? 10 : pageSize;

        // Fetch paginated data
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        // Map the entities to the destination type
        var mappedItems = items.Adapt<List<TDestination>>();

        return new PaginationResponse<TDestination>(mappedItems, totalCount, pageNumber, pageSize);
    }

    public static IQueryable<T> ApplySorting<T>(this IQueryable<T> query, string? sortField, string? sortOrder, IEnumerable<string> allowedFields, string defaultSort, string defaultSortOrder = "asc")
    {
        sortField = string.IsNullOrEmpty(sortField) ? defaultSort : sortField.ToLower();
        sortOrder = string.IsNullOrEmpty(sortOrder) ? defaultSortOrder : sortOrder.ToLower();
        string? matchedField = allowedFields.FirstOrDefault(f => f.Equals(sortField, StringComparison.OrdinalIgnoreCase));
        if (string.IsNullOrEmpty(matchedField)) return query;

        var expression = GetPropertyLambda<T>(matchedField);
        return sortOrder == "desc"
            ? query.OrderByDescending(expression)
            : query.OrderBy(expression);
    }

    private static Expression<Func<T, object>> GetPropertyLambda<T>(string propertyName)
    {
        var parameter = Expression.Parameter(typeof(T), "x");
        var property = Expression.PropertyOrField(parameter, propertyName);
        var converted = Expression.Convert(property, typeof(object));
        return Expression.Lambda<Func<T, object>>(converted, parameter);
    }
}
