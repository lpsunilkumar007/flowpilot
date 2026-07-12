using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.Setting.Models;
public class ViewSettingValuesDto
{
    [Required]
    public required string OriginalValue { get; set; }

    [Required]
    public required string SettingValues { get; set; }
}
