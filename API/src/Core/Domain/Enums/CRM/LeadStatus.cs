namespace FlowPilot.Domain.Enums.CRM;

/// <summary>
/// Default lead status values used only when seeding LookUpCodeValues.
/// Runtime status handling must use LookupCodeValues, not this enum.
/// </summary>
public enum LeadStatus
{
    New = 0,
    Contacted = 1,
    Qualified = 2,
    DemoScheduled = 3,
    DemoCompleted = 4,
    ProposalSent = 5,
    Negotiation = 6,
    Won = 7,
    Lost = 8,
    OnHold = 9,
}
