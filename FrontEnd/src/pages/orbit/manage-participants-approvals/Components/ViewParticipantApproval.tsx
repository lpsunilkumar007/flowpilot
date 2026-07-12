import React, { useState, useEffect, useCallback } from 'react'
import moment from 'moment'
import { GetParticipantAppointmentDetailRequest, ViewParticipantAppointmentRequestResponse, ParticipantApprovalRequest, AppointmentStatus, AppointmentParticipantResponseStatus } from '@/helpers/api/WebApiClient'
import { participantRequestService } from '@/services/ParticipantRequestService'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import ParticipantApprovalHeader from './ParticipantApprovalHeader'
import ParticipantApprovalBody from './ParticipantApprovalBody'
import ParticipantApprovalFooter from './ParticipantApprovalFooter'
import ParticipantCancelAppointmentEvent from './ParticipantCancelAppointment'

interface TimeSlot {
	timeFrom: moment.Moment
	timeTo: moment.Moment
	onDate: moment.Moment
}

interface ViewParticipantApprovalProps {
	urlIdentifier?: string
}

type ModalState = {
	appointmentData: ViewParticipantAppointmentRequestResponse | null
	selectedDate: moment.Moment | null
	selectedTimeSlot: TimeSlot | null
	loading: boolean
	approvalMessage: string | null
	errorMessage: string | null
	headerMessage: string
	isCancelAppointmentVisible: boolean
	scheduleMessage: string
	getErrorMessage: string | null
}

const ViewParticipantApproval: React.FC<ViewParticipantApprovalProps> = ({ urlIdentifier: propUrlIdentifier }) => {
	const urlIdentifier = propUrlIdentifier || ''
	const [reloadAppointments, setReloadAppointments] = useState<boolean>(false)
	const [modalState, setModalState] = useState<ModalState>({
		appointmentData: null,
		selectedDate: null,
		selectedTimeSlot: null,
		loading: false,
		approvalMessage: null,
		errorMessage: null,
		headerMessage: 'Welcome',
		isCancelAppointmentVisible: false,
		scheduleMessage: 'Scheduled',
		getErrorMessage: null,
	})

	const assignValueToModal = (modalName: keyof ModalState, value: any) => {
		setModalState((prev) => ({
			...prev,
			[modalName]: value,
		}))
	}

	const loadingIndicator = () => <AnimationSkeleton />

	const loadAppointmentDetails = async () => {
		if (!urlIdentifier) return
		try {
			assignValueToModal('loading', true)
			const request = new GetParticipantAppointmentDetailRequest({
				urlIdentifier: urlIdentifier,
			})
			const data = await participantRequestService.viewParticipantAppointment(request)
			const status = data.participantDetails.appointmentParticipantResponseStatus
			assignValueToModal('appointmentData', data)
			if (data.participantDetails?.appointmentParticipantResponseStatus !== AppointmentParticipantResponseStatus.Pending) {
				assignValueToModal('errorMessage', `This appointment has already been ${status}.`)
				assignValueToModal('headerMessage', 'Hello')
				assignValueToModal('scheduleMessage', status)
			}
		} catch (error: any) {
			assignValueToModal('getErrorMessage', error.exception)
		} finally {
			assignValueToModal('loading', false)
		}
	}

	useEffect(() => {
		if (urlIdentifier) {
			loadAppointmentDetails()
		}
	}, [reloadAppointments])

	const handleCancel = () => {
		assignValueToModal('isCancelAppointmentVisible', true)
		assignValueToModal('headerMessage', 'Hello')
		assignValueToModal('scheduleMessage', 'Declined')
	}

	const handleConfirm = async () => {
		if (!modalState.selectedTimeSlot || !modalState.appointmentData || !modalState.selectedDate) return
		const payload = new ParticipantApprovalRequest({
			urlIdentifier: urlIdentifier,
			selectedDate: modalState.selectedDate,
			selectedTimeFrom: modalState.selectedTimeSlot.timeFrom,
			selectedTimeTo: modalState.selectedTimeSlot.timeTo,
		})
		try {
			const response = await participantRequestService.participantApproval(payload)
			const message = `Your appointment on ${response.selectedDate.format('DD-MM-YYYY')} at ${response.selectedTimeFrom.format('hh:mm A')}-${response.selectedTimeTo.format('hh:mm A')} has been successfully accepted.`
			assignValueToModal('approvalMessage', message)
			assignValueToModal('headerMessage', 'Thanks')
			assignValueToModal('scheduleMessage', 'Accepted')
		} catch (error: any) {
			assignValueToModal('errorMessage', error.exception)
			assignValueToModal('headerMessage', 'Hello')
		}
	}

	const handleSelectionChange = (selectedDate: moment.Moment | null, selectedTimeSlot: TimeSlot | null) => {
		assignValueToModal('selectedDate', selectedDate)
		assignValueToModal('selectedTimeSlot', selectedTimeSlot)
	}

	return (
		<>
			{modalState.loading && loadingIndicator()}

			{!modalState.loading && modalState.appointmentData && (
				<div className="participant-approval-bg">
					<div className="participant-approval-card">
						<ParticipantApprovalHeader headerMessage={modalState.headerMessage} scheduleMessage={modalState.scheduleMessage} appointmentData={modalState.appointmentData} />

						{modalState.errorMessage && (
							<div className="px-6 sm:px-10 pt-6 pb-4 text-center border-b orbit-info-panel">
								<p className="text-base sm:text-lg orbit-link font-medium max-w-2xl mx-auto">{modalState.errorMessage}</p>
							</div>
						)}

						{!modalState.errorMessage &&
							!modalState.isCancelAppointmentVisible &&
							(modalState.approvalMessage ? (
								<div className="px-6 sm:px-10 pt-10 pb-6 text-center border-b border-gray-200">
									<p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-medium">{modalState.approvalMessage}</p>
								</div>
							) : (
								<>
									<ParticipantApprovalBody appointmentData={modalState.appointmentData} onSelectionChange={handleSelectionChange} />
									<ParticipantApprovalFooter selectedDate={modalState.selectedDate} selectedTimeSlot={modalState.selectedTimeSlot} onCancel={handleCancel} onConfirm={handleConfirm} />
								</>
							))}

						{modalState.isCancelAppointmentVisible && (
							<ParticipantCancelAppointmentEvent
								cancelAppointmentOutPut={() => {
									assignValueToModal('isCancelAppointmentVisible', false)
									assignValueToModal('scheduleMessage', 'Scheduled')
									setReloadAppointments(true)
								}}
								urlIdentifier={urlIdentifier}
							/>
						)}
					</div>
				</div>
			)}

			{modalState.getErrorMessage && (
				<div className="h-full bg-gradient-to-br xl:min-h-screen xl:py-9 flex flex-col items-center">
					<div className="w-full max-w-7xl  bg-transparent animate-fade-in">
						{modalState.getErrorMessage && (
							<div className="px-6 sm:px-10 pt-6 pb-4 text-center bg-transparent">
								<p className="text-base sm:text-lg orbit-link font-medium max-w-2xl mx-auto">{modalState.getErrorMessage}</p>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	)
}

export default ViewParticipantApproval
