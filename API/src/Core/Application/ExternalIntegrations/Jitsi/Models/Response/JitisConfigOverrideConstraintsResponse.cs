using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlowPilot.Application.ExternalIntegrations.Jitsi.Models.Response;
public class JitisConfigOverrideConstraintsResponse
{
    public JitisConfigOverrideConstraintsVideoResponse video { get; set; } = new JitisConfigOverrideConstraintsVideoResponse();
}