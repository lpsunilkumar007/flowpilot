using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlowPilot.Application.ExternalIntegrations.Jitsi.Models.Response;
public class JitisConfigOverrideConstraintsVideoHeightResponse
{
    public int ideal { get; set; } = 1080;

    public int min { get; set; } = 720;

    public int max { get; set; } = 2160;

}
