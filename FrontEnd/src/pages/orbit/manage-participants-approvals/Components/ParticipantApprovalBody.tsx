import React from 'react'
import moment from 'moment'
import { ViewParticipantAppointmentRequestResponse } from '@/helpers/api/WebApiClient'
import ParticipantApprovalLeftSide from './ParticipantApprovalLeftSide'
import ParticipantApprovalRightSide from './ParticipantApprovalRightSide'
import { PopupBody } from '@/components'

interface ParticipantApprovalBodyProps {
	appointmentData: ViewParticipantAppointmentRequestResponse
	onSelectionChange?: (selectedDate: moment.Moment | null, selectedTimeSlot: any | null) => void
}

const ParticipantApprovalBody: React.FC<ParticipantApprovalBodyProps> = ({ appointmentData, onSelectionChange }) => {
	return (
		<PopupBody>
			<div className="grid lg:grid-cols-2 gap-4 m-4">
				<ParticipantApprovalLeftSide appointmentData={appointmentData} />
				<ParticipantApprovalRightSide appointmentData={appointmentData} onSelectionChange={onSelectionChange} />
			</div>
		</PopupBody>
	)
}

export default ParticipantApprovalBody
