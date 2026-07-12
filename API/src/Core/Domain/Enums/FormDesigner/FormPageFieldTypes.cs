using System.ComponentModel;

namespace FlowPilot.Domain.Enums.FormDesigner;
public enum FormPageFieldTypes
{
    [Description("Number")]
    Number = 1,
    [Description("Single Choice – Dropdown")]
    Select = 2,


    //[Description("Date Time")]
    //DateTime = 2,

    //[Description("Text (Short Answer)")]
    //TextField = 3,

    //[Description("Text Area (Paragraph)")]
    //TextArea = 4,
}
