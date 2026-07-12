using System.ComponentModel;

namespace FlowPilot.Domain.Enums.Appointment;
public enum MeetingParticipantPresenceStatus
{
    [Description("Not joined")]
    NotJoined = 0,

    [Description("Joined")]
    Joined = 1,

    [Description("Disconnected")]
    Disconnected = 2
}
