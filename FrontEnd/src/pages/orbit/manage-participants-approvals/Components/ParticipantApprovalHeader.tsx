import React from 'react'
import { ViewParticipantAppointmentRequestResponse } from '@/helpers/api/WebApiClient'

interface ParticipantApprovalHeaderProps {
	appointmentData: ViewParticipantAppointmentRequestResponse
	headerMessage: string
	scheduleMessage: string
}

const ParticipantApprovalHeader: React.FC<ParticipantApprovalHeaderProps> = (props) => {
	const getHostName = (): string => {
		if (!props.appointmentData.hostDetails.participantDetail) return ''
		const { firstName, lastName } = props.appointmentData.hostDetails.participantDetail
		return `${firstName || ''} ${lastName || ''}`.trim() || 'Host'
	}

	const getParticipantName = (): string => {
		if (!props.appointmentData.participantDetails) return 'Guest'
		const { firstName, lastName } = props.appointmentData.participantDetails.participantDetail
		return `${firstName || ''} ${lastName || ''}`.trim() || 'Guest'
	}

	return (
		<>
			<div className="px-6 sm:px-10 pt-10 pb-6 text-center border-b border-gray-200">
				<h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-2">
					{props.headerMessage}, <span className="orbit-link">{getParticipantName()}</span>
				</h1>
				<p className="text-base sm:text-lg orbit-label-secondary max-w-2xl mx-auto font-medium">
					Your appointment {props.scheduleMessage.toLocaleLowerCase()} with <span className="font-bold">{getHostName()}</span>
				</p>
			</div>
		</>
	)
}
export default ParticipantApprovalHeader

