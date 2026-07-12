import { appointmentRequestClient } from '@/helpers/api/apiClients'
import type { IAppointmentRequestRepository } from './contracts/IAppointmentRequestRepository'

/**
 * Appointment request service - abstraction over appointment request API client.
 * Use this instead of importing appointmentRequestClient directly for better testability.
 */
export const appointmentRequestService: IAppointmentRequestRepository = {
	getAppointment: (request) => appointmentRequestClient.getAppointment(request),
	getById: (id) => appointmentRequestClient.getById(id),
	create: (request) => appointmentRequestClient.create(request),
	rescheduleAppointment: (request) => appointmentRequestClient.rescheduleAppointment(request),
	cancelAppointment: (request) => appointmentRequestClient.cancelAppointment(request),
}
