import type {
	GetParticipantAppointmentDetailRequest,
	MeetingParticipantPresenceRequest,
	ParticipantApprovalRequest,
	ParticipantApprovalResponse,
	ParticipantCancelRequest,
	StartMeetingResponse,
	ViewParticipantAppointmentRequestResponse,
} from '@/helpers/api/WebApiClient'

export interface IParticipantRequestRepository {
	startMeeting(meetingUrlIdentifier: string): Promise<StartMeetingResponse>
	meetingParticipantPresence(request: MeetingParticipantPresenceRequest): Promise<string>
	viewParticipantAppointment(request: GetParticipantAppointmentDetailRequest): Promise<ViewParticipantAppointmentRequestResponse>
	participantApproval(request: ParticipantApprovalRequest): Promise<ParticipantApprovalResponse>
	participantCancel(request: ParticipantCancelRequest): Promise<string>
}
