using System.ComponentModel;

namespace FlowPilot.Domain.Enums;

public enum FileType
{
    [Description(".jpg,.png,.jpeg")]
    Image,
    [Description(".pdf,.docx,.doc,.txt,.zip,.rar")]
    Document,
    [Description(".pdf,.docx,.doc,.txt,.zip,.rar,.xls,.xlsx,.csv,.jpg,.png,.jpeg")]
    AllValidDocuments
}