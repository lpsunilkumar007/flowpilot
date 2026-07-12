using FlowPilot.Application.Appointment.Models.Request.AppointmentParticipant;
using FlowPilot.Application.Appointment.Models.Request.Jitsi;
using FlowPilot.Application.Appointment.Models.Response.AppointmentParticipant;

namespace FlowPilot.Application.Appointment;
public interface IParticipantAppointmentBookingService : ITransientService
{
    Task<ViewParticipantAppointmentRequestResponse> ViewParticipantAppointmentDetailAsync(GetParticipantAppointmentDetailRequest request);
    Task<ParticipantApprovalResponse> ParticipantApprovalAsync(ParticipantApprovalRequest request);

    Task<string> ParticipantCancelAsync(ParticipantCancelRequest request);

    Task<StartMeetingResponse> StartMeetingAsync(string meetingUrlIdentifier);
    Task<string> MeetingParticipantPresenceAsync(MeetingParticipantPresenceRequest request);

}