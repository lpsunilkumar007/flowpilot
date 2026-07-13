using FlowPilot.Application.Common.Models;
using FlowPilot.Application.Email;
using FlowPilot.Application.Email.Model.Request;
using FlowPilot.Application.Email.Model.Response;
using FlowPilot.Domain.Email;
using FlowPilot.Infrastructure.Persistence.Context;
using FlowPilot.Infrastructure.SystemConstants;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Orbit.Email;
internal class EmailLogService : IEmailLogService
{
    private readonly ApplicationDbContext _context;
    public EmailLogService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddEmailLogAsync(EmailLog emailLog)
    {
        await _context.EmailLog.AddAsync(emailLog);
        await _context.SaveChangesAsync();
    }

    public async Task<PaginationResponse<ViewEmailLogResponse>> GetEmailLogAsync(SearchEmailLogRequest request)
    {
        var query = _context.EmailLog.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.From))
        {
            query = query.Where(x => x.From.Contains(request.From));
        }

        if (!string.IsNullOrWhiteSpace(request.To))
        {
            query = query.Where(x => x.To.Contains(request.To));
        }

        if (!string.IsNullOrWhiteSpace(request.Subject))
        {
            query = query.Where(x => x.Subject.Contains(request.Subject));
        }

        if (request.SentStatus != null)
        {
            query = query.Where(x => x.IsEmailSent == request.SentStatus);
        }

        if (request.SendDateTimeOffset.HasValue)
        {
            query = query.Where(x => x.CreatedOn == request.SendDateTimeOffset.Value);
        }

        if (!string.IsNullOrEmpty(request.sortField))
        {
            query = query.ApplySorting(sortField: request.sortField, sortOrder: request.sortOrder, ["to","from", "subject", "createdOn", "IsEmailSent"], "to");
        }

        return await query.PaginatedListAsync<EmailLog, ViewEmailLogResponse>(request.PageNumber, request.PageSize);
    }

    public async Task<ViewEmailLogDetailResponse> GetEmailLogByIdAsync(int id)
    {
        var entity = await _context.EmailLog.SingleOrDefaultAsync(x => x.Id == id);
        _ = entity ?? throw new NotImplementedException(string.Format(ErrorMessages.ItemNotFound, "Item"));
        return entity.Adapt<ViewEmailLogDetailResponse>();
    }
}
