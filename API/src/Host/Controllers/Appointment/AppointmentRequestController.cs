using FlowPilot.Application.Appointment;
using FlowPilot.Application.Appointment.Models.Request;
using FlowPilot.Application.Appointment.Models.Response;
using FlowPilot.Host.Controllers.BaseControllers;

namespace FlowPilot.Host.Controllers.Appointment;

public class AppointmentRequestController : VersionNeutralApiController
{
    private readonly IAppointmentRequestService _appointmentRequestService;

    public AppointmentRequestController(IAppointmentRequestService appointmentRequestService) => _appointmentRequestService = appointmentRequestService;

    [HttpPost]
    [OpenApiOperation("Creates a new appointment.", "")]
    [MustHavePermission(SystemAction.Create, SystemResource.Appointment)]
    public Task<CreateAppointmentResponse> CreateAsync(CreateAppointmentRequest request)
    {
        return _appointmentRequestService.CreateAppointmentRequest(request, false);
    }

    [HttpPost("get-appointment")]
    [MustHavePermission(SystemAction.View, SystemResource.Appointment)]
    [OpenApiOperation("Get list of all appointment.", "")]
    public Task<List<ViewAppointments>> GetAppointmentAsync(SearchAppointmentsRequest SearchAppointmentsRequest)
    {
        return _appointmentRequestService.ViewAppointments(SearchAppointmentsRequest);
    }

    [HttpGet("get-appointment/{id}")]
    [MustHavePermission(SystemAction.View, SystemResource.Appointment)]
    [OpenApiOperation("Get a appointment's details.", "")]
    public Task<ViewAppointmentRequestResponse> GetByIdAsync(int id)
    {
        return _appointmentRequestService.ViewAppointmentRequestById(id);
    }

    [HttpPost("appointment-reschedule")]
    [MustHavePermission(SystemAction.Create, SystemResource.Appointment)]
    [OpenApiOperation("Reschedule  appointment", "")]
    public Task<CreateAppointmentResponse> RescheduleAppointmentAsync(RescheduleAppointmentRequest request)
    {
        return _appointmentRequestService.RescheduleAppointmentRequest(request);
    }

    [HttpPut("appointment-cancel")]
    [MustHavePermission(SystemAction.Update, SystemResource.Appointment)]
    [OpenApiOperation("Cancel  appointment", "")]
    public Task<string> CancelAppointmentAsync(CancelAppointmentRequest request)
    {
        return _appointmentRequestService.CancelAppointment(request);
    }
}
