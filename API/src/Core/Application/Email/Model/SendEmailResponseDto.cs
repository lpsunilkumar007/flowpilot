using System.ComponentModel.DataAnnotations;

namespace FlowPilot.Application.Email.Model;
public class SendEmailResponseDto
{
    [Required]
    public required bool IsEmailSent { get; set; }

    [Required]
    public required DefaultIdType EmailLogId { get; set; }
}

