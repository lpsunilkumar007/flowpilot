namespace FlowPilot.Application.ExternalIntegrations.Jitsi.Models.Response;
public class JitisConfigOverrideConstraintsVideoResponse
{
    public JitisConfigOverrideConstraintsVideoHeightResponse height { get; set; } = new JitisConfigOverrideConstraintsVideoHeightResponse()
    {
        ideal = 1080,
        min = 720,
        max = 2160
    };

    public JitisConfigOverrideConstraintsVideoHeightResponse width { get; set; } = new JitisConfigOverrideConstraintsVideoHeightResponse()
    {
        ideal = 1920,
        min = 1280,
        max = 3840
    };

}
