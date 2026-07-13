using FlowPilot.Application.Appointment;
using FlowPilot.Application.Appointment.Models.Request.AppointmentParticipant;
using FlowPilot.Application.Appointment.Models.Request.Jitsi;
using FlowPilot.Application.Appointment.Models.Response.AppointmentParticipant;
using FlowPilot.Host.Controllers.BaseControllers;

namespace FlowPilot.Host.Controllers.Appointment;

public class ParticipantRequestController : VersionNeutralApiController
{
    private readonly IParticipantAppointmentBookingService _participantAppointmentBookingService;

    public ParticipantRequestController(IParticipantAppointmentBookingService participantAppointmentBookingService)
    {
        _participantAppointmentBookingService = participantAppointmentBookingService;
    }

    [HttpPost("view-participant")]
    [AllowAnonymous]
    [OpenApiOperation("View Participant detail.", "")]
    public Task<ViewParticipantAppointmentRequestResponse> ViewParticipantAppointmentAsync(GetParticipantAppointmentDetailRequest request)
    {
        return _participantAppointmentBookingService.ViewParticipantAppointmentDetailAsync(request);
    }

    [HttpPost("participant-confirmation")]
    [AllowAnonymous]
    [OpenApiOperation("Confirm appointment approval", "")]
    public Task<ParticipantApprovalResponse> ParticipantApprovalAsync(ParticipantApprovalRequest request)
    {
        return _participantAppointmentBookingService.ParticipantApprovalAsync(request);
    }


    [HttpPost("participant-cancel")]
    [AllowAnonymous]
    [OpenApiOperation("Cancel appointment approval", "")]
    public Task<string> ParticipantCancelAsync(ParticipantCancelRequest request)
    {
        return _participantAppointmentBookingService.ParticipantCancelAsync(request);
    }

    [AllowAnonymous]
    [HttpPost("start-meeting/{meetingUrlIdentifier}")]
    public async Task<StartMeetingResponse> StartMeeting(string meetingUrlIdentifier)
    {
        return await _participantAppointmentBookingService.StartMeetingAsync(meetingUrlIdentifier);
    }

    [AllowAnonymous]
    [HttpPost("meeting-participant-presence")]
    public async Task<string> MeetingParticipantPresence(MeetingParticipantPresenceRequest request)
    {
        return await _participantAppointmentBookingService.MeetingParticipantPresenceAsync(request);
    }
}
