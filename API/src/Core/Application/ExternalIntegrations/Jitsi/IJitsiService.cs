using FlowPilot.Application.Nexus.Identity.Users.Models.Response;

namespace FlowPilot.Application.ExternalIntegrations.Jitsi;
public interface IJitsiService : ITransientService
{
    string GenerateToken(string roomName, bool isModerator, ViewUserDetailsResponse viewUserDetailsResponse);
}
