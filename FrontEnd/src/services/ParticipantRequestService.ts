import { participantRequestClient } from '@/helpers/api/apiClients'
import type { IParticipantRequestRepository } from './contracts/IParticipantRequestRepository'

/**
 * Participant request service - abstraction over participant request API client.
 * Use this instead of importing participantRequestClient directly for better testability.
 */
export const participantRequestService: IParticipantRequestRepository = {
	startMeeting: (meetingUrlIdentifier) => participantRequestClient.startMeeting(meetingUrlIdentifier),
	meetingParticipantPresence: (request) => participantRequestClient.meetingParticipantPresence(request),
	viewParticipantAppointment: (request) => participantRequestClient.viewParticipantAppointment(request),
	participantApproval: (request) => participantRequestClient.participantApproval(request),
	participantCancel: (request) => participantRequestClient.participantCancel(request),
}
