using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Infrastructure.SystemConstants;
using Microsoft.EntityFrameworkCore;

namespace FlowPilot.Infrastructure.Orbit.Appointment;
public partial class AppointmentRequestService
{
    public async Task ExecuteAppointmentApprovalRule(DefaultIdType id)
    {
        var entity = await _applicationDbContext.TempAppointments
           .Include(x => x.TempAppointmentParticipants)
            .Include(x => x.TempAppointmentAvailabilityWindows)
           .SingleOrDefaultAsync(x => x.Id == id);

        _ = entity ?? throw new NotFoundException(string.Format(ErrorMessages.ItemNotFound, "appointment"));

        switch (entity.ApprovalRule)
        {
            case Domain.Enums.Appointment.AppointmentApprovalRule.HostConfirms:
                var tempAppointmentParticipants = entity.TempAppointmentParticipants.Where(x => x.AppointmentParticipantResponseStatus != Domain.Enums.Appointment.AppointmentParticipantResponseStatus.Accepted).ToList();
                tempAppointmentParticipants.ForEach(x =>
                {
                    x.AppointmentParticipantResponseStatus = Domain.Enums.Appointment.AppointmentParticipantResponseStatus.Accepted;
                    x.ApproveForDate = entity.TempAppointmentAvailabilityWindows[0].OnDate;
                    x.ApproveTimeFrom = entity.TempAppointmentAvailabilityWindows[0].TimeFrom;
                    x.ApproveTimeTo = entity.TempAppointmentAvailabilityWindows[0].TimeTo;
                });
                entity.AppointmentStatus = Domain.Enums.Appointment.AppointmentStatus.Scheduled;
                _applicationDbContext.TempAppointments.UpdateRange(entity);

                _applicationDbContext.TempAppointmentParticipants.UpdateRange(tempAppointmentParticipants);
                await _applicationDbContext.SaveChangesAsync();
                break;
            default:
                // case Domain.Enums.Appointment.AppointmentApprovalRule.ConfirmedOnlyWhenApprovedByAllRequiredParticipants:
                var case1 = entity.TempAppointmentParticipants.Where(x => x.AppointmentParticipantResponseStatus != Domain.Enums.Appointment.AppointmentParticipantResponseStatus.Accepted).ToList();
                if (case1.Count == 0)
                {
                    entity.AppointmentStatus = Domain.Enums.Appointment.AppointmentStatus.Scheduled;
                    _applicationDbContext.TempAppointments.UpdateRange(entity);
                    await _applicationDbContext.SaveChangesAsync();
                }

                break;
        }
    }
}
