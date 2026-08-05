using System.ComponentModel;

namespace FlowPilot.Domain.Enums.CRM;

/// <summary>
/// Default lead source values used only when seeding LookUpCodeValues.
/// Runtime source handling must use LookupCodeValues, not this enum.
/// </summary>
public enum LeadSource
{
    [Description("Website")]
    Website = 0,

    [Description("Referral")]
    Referral = 1,

    [Description("Cold Call")]
    ColdCall = 2,

    [Description("Walk-in")]
    WalkIn = 3,

    [Description("Social Media")]
    SocialMedia = 4,

    [Description("Partner")]
    Partner = 5,

    [Description("Other")]
    Other = 6,
}
