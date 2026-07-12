using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.ExternalIntegrations.Jitsi.Models.Response;
public class JitsiRoomSettingResponse
{
    [Required]
    public required string Domain { get; set; }

    [Required]
    public required string RoomName { get; set; }

    [Required]
    public required string JWtToken { get; set; }

    public JitsiConfigOverwriteResponse JitsiConfigOverwrite { get; set; }

    public JitsiInterfaceConfigOverwriteResponse jitsiInterfaceConfigOverwrite { get; set; }
}
