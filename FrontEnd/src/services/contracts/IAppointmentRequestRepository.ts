import type {
	CancelAppointmentRequest,
	CreateAppointmentRequest,
	CreateAppointmentResponse,
	RescheduleAppointmentRequest,
	SearchAppointmentsRequest,
	ViewAppointmentRequestResponse,
	ViewAppointments,
} from '@/helpers/api/WebApiClient'

export interface IAppointmentRequestRepository {
	getAppointment(request: SearchAppointmentsRequest): Promise<ViewAppointments[]>
	getById(id: number): Promise<ViewAppointmentRequestResponse>
	create(request: CreateAppointmentRequest): Promise<CreateAppointmentResponse>
	rescheduleAppointment(request: RescheduleAppointmentRequest): Promise<CreateAppointmentResponse>
	cancelAppointment(request: CancelAppointmentRequest): Promise<string>
}
