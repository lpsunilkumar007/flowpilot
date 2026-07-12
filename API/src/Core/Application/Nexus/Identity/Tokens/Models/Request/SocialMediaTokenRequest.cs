using System.ComponentModel.DataAnnotations;
using FlowPilot.Domain.Enums.Nexus;
using FlowPilot.Shared.Common.Validation;

namespace FlowPilot.Application.Nexus.Identity.Tokens.Models.Request;
public class SocialMediaTokenRequest
{
    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    public required string JsonResponse { get; set; }

    [Required(ErrorMessage = ValidationMessages.RequiredMessage)]
    [EnumDataType(typeof(UserRegistrationType), ErrorMessage = ValidationMessages.RequiredMessage)]
    public required UserRegistrationType SocialMediaType { get; set; }
}

public class FacebookResponseDto
{
    public string name { get; set; }
    public string email { get; set; }
    public Picture picture { get; set; }
    public string id { get; set; }

    public class Picture
    {
        public Data data { get; set; }
    }

    public class Data
    {
        public int height { get; set; }
        public bool is_silhouette { get; set; }
        public string url { get; set; }
        public int width { get; set; }
    }
}