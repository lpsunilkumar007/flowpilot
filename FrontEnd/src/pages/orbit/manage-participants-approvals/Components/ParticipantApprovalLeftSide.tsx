import React from 'react'
import { ViewParticipantAppointmentRequestResponse } from '@/helpers/api/WebApiClient'
import { imageHelper } from '@/helpers/image.halper'

interface ParticipantApprovalLeftSideProps {
	appointmentData: ViewParticipantAppointmentRequestResponse
}

const ParticipantApprovalLeftSide: React.FC<ParticipantApprovalLeftSideProps> = ({ appointmentData }) => {
	const getParticipantName = (): string => {
		if (!appointmentData.participantDetails) return 'Guest'
		const { firstName, lastName } = appointmentData.participantDetails.participantDetail
		return `${firstName || ''} ${lastName || ''}`.trim() || 'Guest'
	}

	return (
		<div className="card p-6 sm:p-10 border-b lg:border-r border-gray-200 flex flex-col items-center text-center">
			<img src={imageHelper.getUserImage(appointmentData.participantDetails.participantDetail.imageUrl)} alt={getParticipantName()} className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-blue-200 shadow-sm" />
			<p className="orbit-body text-base font-semibold mb-1">{getParticipantName()}</p>
			<h2 className="text-xl sm:text-2xl font-bold orbit-heading mb-2">{appointmentData.title}</h2>
			<div className="flex items-center orbit-body text-sm font-semibold mb-6">
				<i className="ri-time-line mr-2 text-blue-500"></i>
				<span>{appointmentData.durationMinutes} Minutes Appointment</span>
			</div>
			{appointmentData.description && (
				<div className="readonly-field">
					<p className="orbit-body text-sm leading-relaxed font-medium">{appointmentData.description}</p>
				</div>
			)}
		</div>
	)
}

export default ParticipantApprovalLeftSide
