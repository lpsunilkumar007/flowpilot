import { MeetingParticipantPresenceRequest, MeetingParticipantPresenceStatus, StartMeetingResponse } from '@/helpers/api/WebApiClient'
import { participantRequestService } from '@/services/ParticipantRequestService'
import { JitsiMeeting } from '@jitsi/react-sdk'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface JitsiMeetingProps {
	meetingResponse: StartMeetingResponse
	meetingUrlIdentifier: string
}

const RenderJitsiMeeting: React.FC<JitsiMeetingProps> = (props) => {
	const { t } = useTranslation()
	const meetingResponse = props.meetingResponse
	const [isLoaded, setIsLoaded] = useState(false)

	const displayName = (p: any) => {
		const u = p?.participantDetail
		const full = `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim()
		return full || u?.userName || u?.email || 'Unknown'
	}

	const avatarSrc = (p: any) => {
		const img = p?.participantDetail?.imageUrl
		if (!img) return null
		// If it already looks like a data URL, return as-is.
		if (img.startsWith('data:image/')) return img
		// If it’s base64 (no prefix), add a prefix (assume png; adjust if needed)
		if (/^[A-Za-z0-9+/]+=*$/.test(img.slice(0, 40))) return `data:image/png;base64,${img}`
		// Otherwise assume it’s a normal URL
		return img
	}

	const roleBadge = (role?: string) => {
		if (role === 'Host') return <span className="orbit-meeting-pill orbit-meeting-pill--host">{t('Meeting.Role_Host', 'Host')}</span>
		if (role === 'Required') return <span className="orbit-meeting-pill orbit-meeting-pill--required">{t('Meeting.Role_Required', 'Required')}</span>
		if (role === 'Optional') return <span className="orbit-meeting-pill orbit-meeting-pill--optional">{t('Meeting.Role_Optional', 'Optional')}</span>
		return <span className="orbit-meeting-pill orbit-meeting-pill--optional">—</span>
	}

	const statusBadge = (status?: string) => {
		if (status === 'Accepted') return <span className="orbit-meeting-pill orbit-meeting-pill--accepted">{t('Meeting.Status_Accepted', 'Accepted')}</span>
		if (status === 'Declined') return <span className="orbit-meeting-pill orbit-meeting-pill--declined">{t('Meeting.Status_Declined', 'Declined')}</span>
		if (status === 'Pending') return <span className="orbit-meeting-pill orbit-meeting-pill--pending">{t('Meeting.Status_Pending', 'Pending')}</span>
		return <span className="orbit-meeting-pill orbit-meeting-pill--optional">—</span>
	}

	const participantPresenceBadge = (status?: MeetingParticipantPresenceStatus) => {
		if (status === MeetingParticipantPresenceStatus.Joined) {
			return <span className="orbit-meeting-pill orbit-meeting-pill--presence-joined">{t('Meeting.Presence_Joined', 'Joined')}</span>
		}

		if (status === MeetingParticipantPresenceStatus.Disconnected) {
			return <span className="orbit-meeting-pill orbit-meeting-pill--presence-disconnected">{t('Meeting.Presence_Disconnected', 'Disconnected')}</span>
		}

		return <span className="orbit-meeting-pill orbit-meeting-pill--presence-not-joined">{t('Meeting.Presence_NotJoined', 'Not joined')}</span>
	}

	const participantAvatarClass = (status?: MeetingParticipantPresenceStatus) => {
		if (status === MeetingParticipantPresenceStatus.Joined) {
			return 'orbit-meeting-avatar--joined'
		}

		if (status === MeetingParticipantPresenceStatus.Disconnected) {
			return 'orbit-meeting-avatar--disconnected'
		}

		return 'orbit-meeting-avatar--unknown'
	}

	const participantMeetingPresence = async (participantMeetingStatus: MeetingParticipantPresenceStatus) => {
		const request = new MeetingParticipantPresenceRequest({
			meetingUrlIdentifier: props.meetingUrlIdentifier,
			status: participantMeetingStatus,
		})
		await participantRequestService.meetingParticipantPresence(request)
	}
	const participants = useMemo(() => meetingResponse.participantDetails ?? [], [meetingResponse.participantDetails])

	return (
		<div className="orbit-meeting-layout">
			<div className="orbit-meeting-stage">
				{!isLoaded && (
					<div className="orbit-meeting-loading">
						<div className="text-center">
							<div className="orbit-meeting-loading-spinner" />
							<p className="text-sm orbit-label-secondary">{t('Meeting.JoiningMeeting', 'Joining meeting…')}</p>
						</div>
					</div>
				)}
				{meetingResponse.jitsiRoomSettingResponse && (
					<div className={isLoaded ? 'block' : 'hidden'}>
						<JitsiMeeting
							domain={meetingResponse.jitsiRoomSettingResponse.domain}
							roomName={meetingResponse.jitsiRoomSettingResponse.roomName}
							jwt={meetingResponse.jitsiRoomSettingResponse.jWtToken}
							onApiReady={(externalApi) => {
								externalApi.addListener('prejoinScreenLoaded', () => {
									setIsLoaded(true)
								})

								externalApi.addListener('videoConferenceJoined', () => participantMeetingPresence(MeetingParticipantPresenceStatus.Joined))
								externalApi.addListener('outgoingMessage', () => {
									// outgoingMessage event - no action needed
								})
								// externalApi.addListener('videoConferenceLeft', () => {
								// 	participantMeetingPresence(MeetingParticipantPresenceStatus.Disconnected)
								// })
								externalApi.addListener('readyToClose', () => {
									participantMeetingPresence(MeetingParticipantPresenceStatus.Disconnected)
								})
							}}
							interfaceConfigOverwrite={{
								...meetingResponse.jitsiRoomSettingResponse.jitsiInterfaceConfigOverwrite,
							}}
							configOverwrite={{
								...meetingResponse.jitsiRoomSettingResponse.jitsiConfigOverwrite,
								disableDeepLinking: true,
								startWithAudioMuted: true,
								startWithVideoMuted: true,
								hideConferenceSubject: true,
								disableProfile: true,
								prejoinConfig: { enabled: true, hideDisplayName: true },
							}}
							getIFrameRef={(node) => {
								if (node) {
									node.style.height = '900px'
									node.style.width = '100%'
								}
							}}
						/>
					</div>
				)}
			</div>

			<div className="orbit-meeting-sidebar">
				<div className="orbit-meeting-sidebar-inner">
					<div className="space-y-2">
						<h2 className="orbit-meeting-meta-title">{meetingResponse.title}</h2>

						{meetingResponse.description && <p className="orbit-meeting-meta-desc">{meetingResponse.description}</p>}

						<div className="mt-2 flex flex-wrap gap-2 text-sm orbit-label-secondary">
							<span className="orbit-meeting-meta-chip">
								{t('Meeting.Duration', 'Duration')}: <span className="font-semibold">{meetingResponse.durationMinutes}</span> {t('Meeting.Min', 'min')}
							</span>

							{meetingResponse.currentParticipantDetail?.timeZone && (
								<span className="orbit-meeting-meta-chip">
									{t('Meeting.YourTZ', 'Your TZ')}: <span className="font-semibold">{meetingResponse.currentParticipantDetail.timeZone}</span>
								</span>
							)}
						</div>
					</div>

					<div className="space-y-3">
						<div className="orbit-meeting-info-card">
							<div className="orbit-meeting-info-label">{t('Meeting.Host', 'Host')}</div>
							<div className="orbit-meeting-info-value">
								{displayName(meetingResponse.hostDetails)}
								{participantPresenceBadge(meetingResponse.hostDetails.meetingParticipantPresenceStatus)}
							</div>
						</div>

						<div className="orbit-meeting-info-card">
							<div className="orbit-meeting-info-label">{t('Meeting.You', 'You')}</div>
							<div className="orbit-meeting-info-value">{displayName(meetingResponse.currentParticipantDetail)}</div>
						</div>
					</div>

					<div className="flex items-center justify-between">
						<h3 className="orbit-meeting-section-title">{t('Meeting.Participants', 'Participants')}</h3>
					</div>

					<div className="space-y-4">
						{participants.map((p: any, idx: number) => {
							const src = avatarSrc(p)
							return (
								<div key={idx} className="orbit-meeting-participant-card">
									<div className={'orbit-meeting-avatar ' + participantAvatarClass(p.meetingParticipantPresenceStatus)}>
										{src ? (
											<img src={src} alt="" className="h-full w-full object-cover" />
										) : (
											<div className="flex h-full w-full items-center justify-center text-sm font-semibold orbit-muted">{displayName(p).slice(0, 2).toUpperCase()}</div>
										)}
									</div>

									<div className="min-w-0 flex-1 space-y-1">
										<div className="truncate text-sm font-semibold text-gray-900">{displayName(p)}</div>

										<div className="flex flex-wrap gap-2">
											{roleBadge(p.appointmentParticipantRole)}
											{statusBadge(p.appointmentParticipantResponseStatus)}
											{participantPresenceBadge(p.meetingParticipantPresenceStatus)}
											{p.timeZone && <span className="orbit-meeting-pill orbit-meeting-pill--optional">{p.timeZone}</span>}
										</div>

										{p.notes && <div className="text-xs orbit-label-secondary mt-1">Notes: {p.notes}</div>}
									</div>
								</div>
							)
						})}
					</div>
				</div>
			</div>
		</div>
	)
}

export default RenderJitsiMeeting
