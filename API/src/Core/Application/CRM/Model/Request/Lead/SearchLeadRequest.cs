using System.ComponentModel.DataAnnotations;
using FlowPilot.Application.Common.Models;
using FlowPilot.Domain.Enums.CRM;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.CRM.Model.Request.Lead;

public class SearchLeadRequest : SearchRequestBaseClass
{
    public LeadFilterType FilterType { get; set; } = LeadFilterType.All;

    public string? SearchText { get; set; }

    public string? AssignedToUserId { get; set; }

    public DateTimeOffset? FromDate { get; set; }

    public DateTimeOffset? ToDate { get; set; }
}
