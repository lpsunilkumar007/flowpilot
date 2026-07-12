using FlowPilot.Application.Appointment.Models.Request;
using FlowPilot.Application.Appointment.Models.Response;
using FlowPilot.Application.Common.Models;

namespace FlowPilot.Application.Appointment;
public interface IAppointmentRequestService : ITransientService
{
    Task<CreateAppointmentResponse> CreateAppointmentRequest(CreateAppointmentRequest request, bool isReschedule);

    Task<List<ViewAppointments>> ViewAppointments(SearchAppointmentsRequest request);

    Task<ViewAppointmentRequestResponse> ViewAppointmentRequestById(DefaultIdType id);

    // Task<ViewAppointmentForParticipantRequestResponse> ViewAppointmentForParticipant(string participantUrlIdentifier);

    Task<CreateAppointmentResponse> RescheduleAppointmentRequest(RescheduleAppointmentRequest request);

    Task<string> CancelAppointment(CancelAppointmentRequest request);
    Task ExecuteAppointmentApprovalRule(DefaultIdType id);
}
