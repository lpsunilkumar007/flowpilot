import { AppointmentLocationType, StartMeetingResponse } from '@/helpers/api/WebApiClient'
import { participantRequestService } from '@/services/ParticipantRequestService'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { lazy, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import withSuspense from '@/helpers/suspense.helper'

const RenderJitsiMeeting = withSuspense(lazy(() => import('./Components/RenderJitsiMeeting')))
type RouteParams = { u: string }

const StartMeeting = () => {
	const { u } = useParams<RouteParams>()
	const [meetingResponse, setMeetingResponse] = useState<StartMeetingResponse>()
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (!u) return
		const load = async () => {
			setLoading(true)
			try {
				const response = await participantRequestService.startMeeting(u)
				setMeetingResponse(response)
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [u])
	return (
		<>
			{loading && <AnimationSkeleton />}
			{!loading && u && meetingResponse && meetingResponse.locationType === AppointmentLocationType.Jitsi && <RenderJitsiMeeting meetingUrlIdentifier={u} meetingResponse={meetingResponse} />}
		</>
	)
}

export default StartMeeting
