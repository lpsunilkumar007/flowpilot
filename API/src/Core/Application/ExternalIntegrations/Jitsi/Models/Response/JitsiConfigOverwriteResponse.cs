namespace FlowPilot.Application.ExternalIntegrations.Jitsi.Models.Response;
public class JitsiConfigOverwriteResponse
{
    public int resolution { get; set; } = 1080;

    public JitisConfigOverrideConstraintsResponse constraints { get; set; } = new JitisConfigOverrideConstraintsResponse();

    public bool startWithAudioMuted { get; set; } = true;

    public bool startWithVideoMuted { get; set; } = true;

    public bool disableModeratorIndicator { get; set; } = true;

    public bool startScreenSharing { get; set; } = false;

    public bool enableEmailInStats { get; set; } = false;

    public JitisConfigOverrideDesktopSharingFrameRateResponse desktopSharingFrameRate { get; set; } = new JitisConfigOverrideDesktopSharingFrameRateResponse()
    {
        min = 5,
        max = 5
    };

}
