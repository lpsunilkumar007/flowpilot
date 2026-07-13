using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Common.Contracts;

namespace FlowPilot.Infrastructure.Nexus.Localization.DbModels;
public class Country : AuditableEntity
{
    [Required]
    public required string CountryName { get; set; }

    [Required]
    public required string CountryCode { get; set; }

    [Required]
    public required DefaultIdType DisplayOrder { get; set; }

    public virtual ICollection<CountryLocalization> CountryLocalizations { get; set; }

}
