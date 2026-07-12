using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.ExternalIntegrations.Stripe.Models.Response;
public class CreateIntentResponse
{
    [Required]
    public required string ClientSecret { get; set; }

    [Required]
    public required bool IsSuccess { get; set; }

    [Required]
    public required string Message { get; set; }

    [Required]
    public required string TransKey { get; set; }

}
