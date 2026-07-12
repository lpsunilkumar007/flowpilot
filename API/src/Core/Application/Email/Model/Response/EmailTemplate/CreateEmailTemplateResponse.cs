using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlowPilot.Application.Email.Model.Response.EmailTemplate;
public class CreateEmailTemplateResponse
{
    [Required]
    public required DefaultIdType Id { get; set; }

    [Required]
    public required string Message { get; set; }
}
