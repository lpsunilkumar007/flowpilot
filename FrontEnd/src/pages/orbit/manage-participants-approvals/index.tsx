import React, { useState } from 'react'
import ViewParticipantApproval from './Components/ViewParticipantApproval'
import { useParams } from 'react-router-dom'

import { AnimationSkeleton } from '@/pages/ui/Skeleton'

type RouteParams = {
	id?: string
}

const ParticipantApproval: React.FC = () => {
	const { id } = useParams<RouteParams>()
	const loadingIndicator = () => <AnimationSkeleton />

	return (
		<>
			{!id && loadingIndicator()}
			{id && <ViewParticipantApproval urlIdentifier={id} />}
		</>
	)
}

export default ParticipantApproval
