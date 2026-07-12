import { FormInput, Label } from '@/components'
import { PageFilter, PageFilterActions, PageFilterFields } from '@/components/PageFilter'
import { PagingVariables } from '@/constants/paging'
import { AppointmentColorSetting, AppointmentParticipantResponseStatus, AppointmentParticipantRole, AppointmentStatus, SearchAppointmentsRequest, UserDropDownItemResponse, ViewAppointmentParticipantResponse, ViewAppointments } from '@/helpers/api/WebApiClient'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { imageHelper } from '@/helpers/image.halper'
import { appointmentRequestService } from '@/services/AppointmentRequestService'
import { DropDownService } from '@/services/DropDownService'
import { settingsService } from '@/services/SettingsService'
import { DatesSetArg, EventClickArg } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ViewAppointmentProps {
	onActionClick: () => void
	onEventClick: (value: any) => void
	refreshData: boolean
}

type ComponentState = {
	events: any[]
	expandedEventIds: string[]
	visibleDateRange: {
		start: string
		end: string
	}
}

type ColorSettingsMap = {
	[key in AppointmentStatus]?: string
}

type ModalState = {
	filterStatus: string
	filterUser: string
	filterGuest: string
	isLoading: boolean
}

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
	<div className="relative group inline-flex items-center justify-center cursor-pointer">
		{children}
		<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:flex bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50 shadow-md">{text}</div>
	</div>
)

const ViewAppointment: React.FC<ViewAppointmentProps> = (props) => {
	const { t } = useTranslation()
	const [componentState, setComponentState] = useState<ComponentState>({
		events: [],
		expandedEventIds: [],
		visibleDateRange: {
			start: moment().startOf('month').format('YYYY-MM-DD'),
			end: moment().endOf('month').format('YYYY-MM-DD'),
		},
	})
	const [colorSettingsMap, setColorSettingsMap] = useState<ColorSettingsMap>({})
	const [users, setUsers] = useState<UserDropDownItemResponse[]>([])
	const [searchAppointmentsRequest, setSearchAppointmentsRequest] = useState<SearchAppointmentsRequest>(
		new SearchAppointmentsRequest({
			pageSize: PagingVariables.DefaultPageSize,
		})
	)
	const [hostUserId, setHostUserId] = useState<string | undefined>(undefined)
	const [guestUserId, setGuestUserId] = useState<string | undefined>(undefined)
	const [modalState, setModalState] = useState<ModalState>({
		filterStatus: 'All',
		filterUser: 'All',
		filterGuest: 'All',
		isLoading: false,
	})
	const { onActionClick, onEventClick, refreshData } = props

	const assignValue = (stateName: keyof ComponentState, value: any) => {
		setComponentState((prev) => ({
			...prev,
			[stateName]: value,
		}))
	}

	const assignValueToModalState = (modalName: keyof ModalState, value: any) => {
		setModalState((prev) => ({
			...prev,
			[modalName]: value,
		}))
	}

	const assignValueToModal = (modalName: keyof SearchAppointmentsRequest, value: any) => {
		if (modalName === 'appointmentStatus') {
			if (value === 'All') {
				value = undefined
			} else {
				value = value as AppointmentStatus
			}
		}
		setSearchAppointmentsRequest(
			(prev) =>
				({
					...prev,
					[modalName]: value,
				}) as SearchAppointmentsRequest
		)
	}

	const handleFilterChange = async (event: any) => {
		const { filterValue, id } = {
			filterValue: event.target.value,
			id: event.target.id,
		}
		if (id === 'appointmentStatus') {
			assignValueToModalState('filterStatus', filterValue)
			assignValueToModal('appointmentStatus', filterValue)
		}
		if (id === 'userId') {
			assignValueToModalState('filterUser', filterValue)
			if (filterValue === 'All') {
				setHostUserId(undefined)
			} else {
				setHostUserId(filterValue)
			}
		}
		if (id === 'guestUserId') {
			assignValueToModalState('filterGuest', filterValue)
			if (filterValue === 'All') {
				setGuestUserId(undefined)
			} else {
				setGuestUserId(filterValue)
			}
		}
	}

	const loadUsers = async () => {
		await runWithToast(async () => {
			const data = await DropDownService.getSystemUsers(false)
			setUsers(data)
			return data
		})
	}

	const loadColorSettings = async () => {
		await runWithToast(async () => {
			const settings = await settingsService.getAppointmentSettings()
			const colorSettings = settings.appointmentColorSetting || []

			const colorMap: ColorSettingsMap = {}
			colorSettings.forEach((setting: AppointmentColorSetting) => {
				if (setting.appointmentStatus && setting.backgroundColor) {
					colorMap[setting.appointmentStatus] = setting.backgroundColor
				}
			})

			setColorSettingsMap(colorMap)
			return colorMap
		})
	}

	const getAppointmentStatusColor = (status?: AppointmentStatus): string => {
		if (!status) return '#9E9E9E'

		return colorSettingsMap[status] || '#9E9E9E'
	}

	const loadAppointments = async (dateRange?: { start: string; end: string }) => {
		await runWithToast(
			async () => {
				const req = new SearchAppointmentsRequest()

				req.appointmentStatus = searchAppointmentsRequest.appointmentStatus

				if (hostUserId) {
					req.hostUserId = hostUserId
				}

				if (guestUserId) {
					req.guestUserId = guestUserId
				}

				const rangeToUse = dateRange || componentState.visibleDateRange
				if (rangeToUse.start && rangeToUse.end) {
					req.startDate = moment(rangeToUse.start).startOf('day')
					req.endDate = moment(rangeToUse.end).endOf('day')
				}

				const res = await appointmentRequestService.getAppointment(req)
				const appointments = res || []
				const allSlots: any[] = []

				appointments.forEach((appt: ViewAppointments) => {
					const backgroundColor = getAppointmentStatusColor(appt.appointmentStatus)

					const participants = appt.appointmentParticipants || []

					;(appt.availabilityWindow || []).forEach((slot: any) => {
						if (!slot?.onDate) return

						const slotDate = moment(slot.onDate).format('YYYY-MM-DD')

						const isScheduledOrRescheduled = appt.appointmentStatus === AppointmentStatus.Scheduled || appt.appointmentStatus === AppointmentStatus.Rescheduled

						if (isScheduledOrRescheduled) {
							const anyParticipantHasApproval = participants.some((p: any) => p.appointmentParticipantRole !== AppointmentParticipantRole.Host && p.approveForDate)

							if (anyParticipantHasApproval) {
								const hasApprovedParticipantForThisSlot = participants.some((p: any) => {
									if (p.appointmentParticipantRole === AppointmentParticipantRole.Host || !p.approveForDate) return false
									return moment(p.approveForDate).format('YYYY-MM-DD') === slotDate
								})

								if (!hasApprovedParticipantForThisSlot) {
									return
								}
							}
						}

						const filteredParticipants = participants
							.filter((p: ViewAppointmentParticipantResponse) => {
								const status = p.appointmentParticipantResponseStatus
								const role = p.appointmentParticipantRole

								if (status === AppointmentParticipantResponseStatus.Accepted && p.approveForDate && role !== AppointmentParticipantRole.Host) {
									const pApprovedDate = moment(p.approveForDate).format('YYYY-MM-DD')
									return pApprovedDate === slotDate
								}

								if (status === AppointmentParticipantResponseStatus.Pending) {
									return true
								}

								if (role === AppointmentParticipantRole.Host) {
									return true
								}

								return true
							})
							.map((p: any) => ({
								name: `${p.participantDetail?.firstName || ''} ${p.participantDetail?.lastName || ''}`.trim(),
								email: p.participantDetail?.email,
								photo: p.participantDetail?.imageUrl || '',
								status: p.appointmentParticipantResponseStatus,
							}))
						allSlots.push({
							appointmentId: appt.id,
							title: appt.title,
							description: appt.description,
							onDate: slotDate,
							backgroundColor,
							appointmentStatus: appt.appointmentStatus,
							participants: filteredParticipants,
						})
					})
				})

				const formatted = allSlots.map((slot, index) => ({
					id: `appt-${slot.appointmentId}-${index}`,
					appointmentId: slot.appointmentId,
					title: slot.title,
					start: moment(slot.onDate).toISOString(),
					backgroundColor: slot.backgroundColor,
					borderColor: slot.backgroundColor,
					allDay: true,
					participants: slot.participants,
					description: slot.description,
					appointmentStatus: slot.appointmentStatus,
				}))

				assignValue('events', formatted)
				return formatted
			},
			{
				setLoading: (loading) => assignValueToModalState('isLoading', loading),
				onError: () => assignValue('events', []),
			}
		)
	}

	const handleDatesSet = (dateInfo: DatesSetArg) => {
		const start = moment(dateInfo.start).format('YYYY-MM-DD')
		const end = moment(dateInfo.end).subtract(1, 'day').format('YYYY-MM-DD')

		const newDateRange = { start, end }

		setComponentState((prev) => ({
			...prev,
			visibleDateRange: newDateRange,
		}))

		if (Object.keys(colorSettingsMap).length > 0) {
			loadAppointments(newDateRange)
		}
	}

	useEffect(() => {
		loadColorSettings()
		loadUsers()
	}, [])

	const resetForm = async () => {
		assignValueToModalState('filterStatus', 'All')
		assignValueToModalState('filterUser', 'All')
		assignValueToModalState('filterGuest', 'All')
		assignValueToModal('appointmentStatus', undefined)
		setHostUserId(undefined)
		setGuestUserId(undefined)
		await loadAppointments()
	}

	useEffect(() => {
		if (Object.keys(colorSettingsMap).length > 0) {
			loadAppointments()
		}
	}, [colorSettingsMap, refreshData, hostUserId, guestUserId, searchAppointmentsRequest.appointmentStatus])

	const handleDateClick = () => onActionClick()

	const handleEventClick = (arg: EventClickArg) => {
		const appointmentId = arg.event.extendedProps.appointmentId
		if (appointmentId) {
			onEventClick(appointmentId)
		}
	}

	const toggleExpand = (eventId: string) => {
		const currentIds = componentState.expandedEventIds
		const updatedIds = currentIds.includes(eventId) ? currentIds.filter((id) => id !== eventId) : [...currentIds, eventId]
		assignValue('expandedEventIds', updatedIds)
	}

	const getStatusIcon = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'pending':
				return (
					<Tooltip text="Pending">
						<i className="ri-hourglass-fill orbit-status-icon--warning text-[12px]" />
					</Tooltip>
				)
			case 'accepted':
				return (
					<Tooltip text="Accepted">
						<i className="ri-check-line orbit-status-icon--success text-[12px]" />
					</Tooltip>
				)
			case 'cancelled':
			case 'declined':
				return (
					<Tooltip text="Cancelled">
						<i className="ri-close-line orbit-status-icon--danger text-[12px]" />
					</Tooltip>
				)
			default:
				return (
					<Tooltip text="Pending">
						<i className="ri-hourglass-fill orbit-status-icon--warning text-[12px]" />
					</Tooltip>
				)
		}
	}

	return (
		<>
			<PageFilter>
				<PageFilterFields className="grid lg:grid-cols-3 gap-6">
					<div>
						<Label variant="search">{t('Manage.Appointments.Search_ByAppointmentStatus', 'Appointment Status')}</Label>
						<div className="relative">
							<FormInput type="bottom-sheet" id="appointmentStatus" name="appointmentStatus" key="appointmentStatus" value={modalState.filterStatus} onChange={(e) => handleFilterChange(e)} className="form-select">
								<option key={'All'} value={'All'}>
									All
								</option>
								{/* <option key={AppointmentStatus.Draft} value={AppointmentStatus.Draft}>
								{AppointmentStatus.Draft}
							</option> */}
								<option key={AppointmentStatus.Proposing} value={AppointmentStatus.Proposing}>
									{AppointmentStatus.Proposing}
								</option>
								{/* <option key={AppointmentStatus.Negotiating} value={AppointmentStatus.Negotiating}>
								{AppointmentStatus.Negotiating}
							</option> */}
								<option key={AppointmentStatus.Scheduled} value={AppointmentStatus.Scheduled}>
									{AppointmentStatus.Scheduled}
								</option>
								<option key={AppointmentStatus.Cancelled} value={AppointmentStatus.Cancelled}>
									{AppointmentStatus.Cancelled}
								</option>
								{/* <option key={AppointmentStatus.Expired} value={AppointmentStatus.Expired}>
								{AppointmentStatus.Expired}
							</option> */}
								<option key={AppointmentStatus.SystemCancelled} value={AppointmentStatus.SystemCancelled}>
									{AppointmentStatus.SystemCancelled}
								</option>
								<option key={AppointmentStatus.Rescheduled} value={AppointmentStatus.Rescheduled}>
									{AppointmentStatus.Rescheduled}
								</option>
							</FormInput>
						</div>
					</div>
					<div>
						<Label variant="search">{t('Manage.Appointments.Search_ByHostUser', 'Host User')}</Label>
						<div className="relative">
							<FormInput type="bottom-sheet" id="userId" name="userId" key="userId" value={modalState.filterUser} onChange={handleFilterChange} className="form-select">
								<option key={'All'} value={'All'}>
									All
								</option>
								{users.map((user) => (
									<option key={user.strValue} value={user.strValue}>
										{user.text}
									</option>
								))}
							</FormInput>
						</div>
					</div>
					<div>
						<Label variant="search">{t('Manage.Appointments.Search_ByGuestUser', 'Guest User')}</Label>
						<div className="relative">
							<FormInput type="bottom-sheet" id="guestUserId" name="guestUserId" key="guestUserId" value={modalState.filterGuest} onChange={handleFilterChange} className="form-select">
								<option key={'All'} value={'All'}>
									All
								</option>
								{users.map((user) => (
									<option key={user.strValue} value={user.strValue}>
										{user.text}
									</option>
								))}
							</FormInput>
						</div>
					</div>
				</PageFilterFields>

				<PageFilterActions>
					<button onClick={() => loadAppointments()} className="btn btn-primary">
						{t('Manage.Appointments.Search_SearchBtn', 'Search')}
					</button>
					<button onClick={resetForm} className="btn btn-secondary">
						{t('Manage.Appointments.Search_ResetBtn', 'Reset')}
					</button>
				</PageFilterActions>
			</PageFilter>

			<div id="calendar">
				<FullCalendar
					initialView="dayGridMonth"
					initialDate={moment().toDate()}
					plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
					headerToolbar={{
						left: 'prev,next today',
						center: 'title',
						right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
					}}
					events={componentState.events}
					datesSet={handleDatesSet}
					dateClick={handleDateClick}
					eventClick={handleEventClick}
					eventContent={(eventInfo) => {
						const eventId = eventInfo.event.id
						const participants = eventInfo.event.extendedProps.participants || []
						const appointmentStatus = eventInfo.event.extendedProps.appointmentStatus as AppointmentStatus
						const isExpanded = componentState.expandedEventIds.includes(eventId)

						const visibleParticipants = isExpanded ? participants : participants.slice(0, 4)

						const isCancelled = appointmentStatus === AppointmentStatus.Cancelled || appointmentStatus === AppointmentStatus.SystemCancelled

						return (
							<div className="p-1">
								<div className={`font-semibold truncate text-sm ${isCancelled ? 'line-through' : ''}`}>{eventInfo.event.title}</div>

								{participants.length > 0 && (
									<div className="flex mt-1 flex-wrap gap-1">
										{visibleParticipants.map((p: any, i: number) => (
											<div key={i} className="flex items-center space-x-1 text-xs bg-gray-100 rounded px-1 py-0.5 shadow-sm">
												<img src={imageHelper.getUserImage(p.photo)} alt={p.name} className="w-5 h-5 rounded-full object-cover border border-gray-300" />
												<span className="text-gray-700 dark:text-gray-700">{p.name?.split(' ')[0]}</span>
												{getStatusIcon(p.status)}
											</div>
										))}

										{participants.length > 4 && (
											<button
												onClick={(e) => {
													e.stopPropagation()
													toggleExpand(eventId)
												}}
												className="text-[10px] underline"
											>
												{isExpanded ? 'Show less' : `+${participants.length - 4}`}
											</button>
										)}
									</div>
								)}
							</div>
						)
					}}
				/>
			</div>
		</>
	)
}

export default ViewAppointment
