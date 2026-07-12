import React, { useState } from 'react'
import moment from 'moment'
import DeleteConfirmation from '@/components/DeleteConfirmation'
import { PopupFooter } from '@/components'

interface TimeSlot {
	timeFrom: moment.Moment
	timeTo: moment.Moment
	onDate: moment.Moment
}

interface ParticipantApprovalFooterProps {
	selectedDate: moment.Moment | null
	selectedTimeSlot: TimeSlot | null
	onCancel: () => void
	onConfirm: () => void
}

const ParticipantApprovalFooter: React.FC<ParticipantApprovalFooterProps> = ({ selectedTimeSlot, onCancel, onConfirm }) => {
	const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)

	return (
		<>
			<PopupFooter>
				<button onClick={() => setShowCancelConfirmation(true)} className="btn btn-secondary">
					Cancel
				</button>
				<button onClick={onConfirm} disabled={!selectedTimeSlot} className={`btn btn-primary ${selectedTimeSlot ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : 'orbit-disabled'}`}>
					Confirm
				</button>

				{showCancelConfirmation && (
					<DeleteConfirmation
						isOpen={showCancelConfirmation}
						onClose={() => setShowCancelConfirmation(false)}
						onConfirm={() => {
							setShowCancelConfirmation(false)
							onCancel()
						}}
						title="Cancel Appointment"
						description="Are you sure you want to cancel this appointment? This action cannot be undone."
						confirmButtonText="Yes, Cancel"
					/>
				)}
			</PopupFooter>
		</>
	)
}

export default ParticipantApprovalFooter
