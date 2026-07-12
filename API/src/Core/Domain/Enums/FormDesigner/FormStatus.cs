using System.ComponentModel;

namespace FlowPilot.Domain.Enums.FormDesigner;
public enum FormStatus
{
    [Description("Draft")]
    Draft = 0,

    [Description("Test")]
    Test = 1,

    [Description("Published")]
    Published = 2,

    [Description("Closed")]
    Closed = 3,
}
