using FlowPilot.Application.Common.Models;
using FlowPilot.Domain.Enums.Nexus;
using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.Nexus.LookUp.Models.Request;
public class SearchNexusLookUpCodeValuesRequest : SearchRequestBaseClass
{
    [Required]
    public NexusLookUpCodeTypes Type { get; set; }
}
