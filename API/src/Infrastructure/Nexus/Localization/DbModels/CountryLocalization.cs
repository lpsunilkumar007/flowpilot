using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using FlowPilot.Domain.Common.Contracts;

namespace FlowPilot.Infrastructure.Nexus.Localization.DbModels;
public class CountryLocalization : AuditableEntity
{

    [ForeignKey(nameof(Country))]
    public required DefaultIdType FKCountryId { get; set; }

    [Required]
    public required string Key { get; set; }

    [Required]
    public required string Value { get; set; }

    public virtual Country Country { get; set; }

}
