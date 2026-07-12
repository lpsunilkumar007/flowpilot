using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlowPilot.Application.ExternalIntegrations.Jitsi.Models.Response;
public class JitisConfigOverrideDesktopSharingFrameRateResponse
{
    public int min { get; set; } = 5;

    public int max { get; set; } = 5;
}
