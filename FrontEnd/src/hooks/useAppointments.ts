import { useEffect, useState } from 'react'
import { appointmentRequestService } from '@/services/AppointmentRequestService'
import type { SearchAppointmentsRequest, ViewAppointments } from '@/helpers/api/WebApiClient'

export function useAppointments(request: SearchAppointmentsRequest, reloadTrigger?: boolean) {
	const [appointments, setAppointments] = useState<ViewAppointments[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	const fetchAppointments = async () => {
		setLoading(true)
		setError(null)
		try {
			const response = await appointmentRequestService.getAppointment(request)
			setAppointments(response || [])
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to fetch appointments'))
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchAppointments()
	}, [reloadTrigger, JSON.stringify(request)])

	return { appointments, loading, error, refetch: fetchAppointments }
}
