using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.Nexus.Identity.Users.Models.Response;
public class AuthenticatorEnableResponse
{
    [Required]
    public required string SecretKey { get; set; }

    [Required]
    public required DownloadFileResponse QrCodeImageUrl { get; set; }

}
