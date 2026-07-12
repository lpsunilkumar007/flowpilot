import { Label, PopupBody, PopupFooter, PopupHeader, PopupWrapper } from '@/components'
import DataGridWithoutPagination from '@/components/DataGrid/DataGridWithoutPagination'
import DeleteConfirmation from '@/components/DeleteConfirmation'
import { AppointmentColorSetting, AppointmentStatus, ViewAppointmentAvailabilityWindowResponse, ViewAppointmentParticipantResponse, ViewAppointmentRequestResponse } from '@/helpers/api/WebApiClient'
import { formatHelper } from '@/helpers/format.helper'
import { gridHelper } from '@/helpers/grid.helper'
import useObjectState from '@/hooks/useObjectState'
import { appointmentRequestService } from '@/services/AppointmentRequestService'
import { settingsService } from '@/services/SettingsService'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { imageHelper } from '../../../../helpers/image.halper'

interface ViewAppointmentDetailProps {
	viewAppointmentOutPut: (isAdded: boolean) => void
	id?: number
	onReschedule: () => void
	onCancelAppointment: () => void
}

type ModalState = {
	rowData: ViewAppointmentParticipantResponse[]
	host: ViewAppointmentParticipantResponse[]
	timeSlots: ViewAppointmentAvailabilityWindowResponse[]
	eventDetailData?: ViewAppointmentRequestResponse
}

type ColorSettingsMap = {
	[key in AppointmentStatus]?: string
}

const ViewAppointmentDetail = (props: ViewAppointmentDetailProps) => {
	const { t } = useTranslation()
	const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)
	const [colorSettingsMap, setColorSettingsMap] = useState<ColorSettingsMap>({})
	const { state: modalState, setKey: setModalKey } = useObjectState<ModalState>({
		rowData: [],
		host: [],
		timeSlots: [],
		eventDetailData: new ViewAppointmentRequestResponse(),
	})

	const loadColorSettings = async () => {
		try {
			const settings = await settingsService.getAppointmentSettings()
			const colorSettings = settings.appointmentColorSetting || []

			const colorMap: ColorSettingsMap = {}
			colorSettings.forEach((setting: AppointmentColorSetting) => {
				if (setting.appointmentStatus && setting.backgroundColor) {
					colorMap[setting.appointmentStatus] = setting.backgroundColor
				}
			})

			setColorSettingsMap(colorMap)
		} catch (error) {
			setColorSettingsMap({})
		}
	}

	const getAppointmentStatusColor = (status?: AppointmentStatus): string => {
		if (!status) return '#9E9E9E'

		return colorSettingsMap[status] || '#9E9E9E'
	}

	useEffect(() => {
		loadColorSettings()
	}, [])

	useEffect(() => {
		const fetchDetail = async () => {
			if (!props.id) return
			const res = await appointmentRequestService.getById(props.id)
			setModalKey('eventDetailData', res)
		}
		fetchDetail()
	}, [props.id])
	useEffect(() => {
		if (modalState.eventDetailData) {
			setModalKey('host', modalState.eventDetailData.appointmentParticipants?.filter((p: ViewAppointmentParticipantResponse) => p.appointmentParticipantRole === 'Host') || [])
			setModalKey('timeSlots', modalState.eventDetailData.availabilityWindow || [])
			setModalKey('rowData', modalState.eventDetailData.appointmentParticipants?.filter((p: ViewAppointmentParticipantResponse) => p.appointmentParticipantRole != 'Host') || [])
		} else {
			setModalKey('rowData', [])
			setModalKey('host', [])
			setModalKey('timeSlots', [])
		}
	}, [modalState.eventDetailData])

	if (!modalState.eventDetailData) return null

	const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
		<div className="relative group inline-flex items-center justify-center cursor-pointer">
			{children}
			<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:flex bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50 shadow-md">{text}</div>
		</div>
	)

	const getStatusIcon = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'pending':
				return (
					<Tooltip text="Pending">
						<i className="ri-hourglass-fill orbit-status-icon--warning text-[12px] cursor-pointer" />
					</Tooltip>
				)
			case 'accepted':
				return (
					<Tooltip text="Accepted">
						<i className="ri-check-line orbit-status-icon--success text-[12px] cursor-pointer" />
					</Tooltip>
				)
			case 'cancelled':
			case 'declined':
				return (
					<Tooltip text="Cancelled">
						<i className="ri-close-line orbit-status-icon--danger text-[12px] cursor-pointer" />
					</Tooltip>
				)
			default:
				return (
					<Tooltip text="Pending">
						<i className="ri-hourglass-fill orbit-status-icon--warning text-[12px] cursor-pointer" />
					</Tooltip>
				)
		}
	}

	const getStatusBadge = (status: string) => {
		const statusLower = status?.toLowerCase() || ''
		let badgeClass = ''
		let icon = ''
		let iconClass = ''

		switch (statusLower) {
			case 'accepted':
				badgeClass = 'orbit-pill orbit-pill--success-soft'
				icon = 'ri-check-line'
				iconClass = 'orbit-status-icon--success'
				break
			case 'pending':
				badgeClass = 'orbit-pill orbit-pill--warning-soft'
				icon = 'ri-hourglass-fill'
				iconClass = 'orbit-status-icon--warning'
				break
			case 'cancelled':
			case 'declined':
				badgeClass = 'orbit-pill orbit-pill--danger-soft'
				icon = 'ri-close-line'
				iconClass = 'orbit-status-icon--danger'
				break
			default:
				badgeClass = 'orbit-pill orbit-pill--warning-soft'
				icon = 'ri-hourglass-fill'
				iconClass = 'orbit-status-icon--warning'
		}

		return (
			<div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${badgeClass}`}>
				<i className={`${icon} ${iconClass} text-sm`}></i>
				<span className="text-sm font-medium orbit-body capitalize">{status || 'Pending'}</span>
			</div>
		)
	}

	const [columnDefs] = useState([
		{
			headerName: t('Manage.Appointments.Grid_Name', 'Name'),
			sort: 'asc',
			valueGetter: (params: any) => `${params.data.participantDetail?.firstName || ''} ${params.data.participantDetail?.lastName || ''}`.trim(),
			sortingOrder: ['asc', 'desc'],
			cellClass: 'truncate',
			comparator: gridHelper.sortingComparator,
		},
		{
			field: 'appointmentParticipantRole',
			headerName: t('Manage.Appointments.Grid_Role', 'Role'),
			sortingOrder: ['asc', 'desc'],
			comparator: gridHelper.sortingComparator,
			valueGetter: (params: any) => params.data.appointmentParticipantRole || '-',
		},
		{
			field: 'appointmentParticipantResponseStatus',
			headerName: t('Manage.Appointments.Grid_Status', 'Status'),
			sortingOrder: ['asc', 'desc'],
			comparator: gridHelper.sortingComparator,
			cellRenderer: (params: any) => {
				const status = params.data.appointmentParticipantResponseStatus || 'Pending'
				return getStatusBadge(status)
			},
			valueGetter: (params: any) => params.data.appointmentParticipantResponseStatus || 'Pending',
		},
		{
			headerName: t('Manage.Appointments.Grid_BookedAppointment', 'Booked Appointment'),
			sortingOrder: ['asc', 'desc'],
			comparator: gridHelper.sortingComparator,
			cellRenderer: (params: any) => {
				const date = params.data.approveForDate ? moment(params.data.approveForDate).format('DD MMM YYYY') : '-'
				const timeFrom = params.data.approveTimeFrom ? moment(params.data.approveTimeFrom).format('hh:mm A') : '-'
				const timeTo = params.data.approveTimeTo ? moment(params.data.approveTimeTo).format('hh:mm A') : '-'

				if (date === '-' || timeFrom === '-' || timeTo === '-') {
					return '-'
				}

				return (
					<div className="line-height-normal">
						<div>{date}</div>
						<div>
							{timeFrom} - {timeTo}
						</div>
					</div>
				)
			},
			valueGetter: (params: any) => {
				const date = params.data.approveForDate ? moment(params.data.approveForDate).format('DD MMM YYYY') : '-'
				const timeFrom = params.data.approveTimeFrom ? moment(params.data.approveTimeFrom).format('hh:mm A') : '-'
				const timeTo = params.data.approveTimeTo ? moment(params.data.approveTimeTo).format('hh:mm A') : '-'
				return `${date} ${timeFrom} ${timeTo}`
			},
		},
		{
			field: 'declinedReason',
			headerName: t('Manage.Appointments.Grid_DeclinedReason', 'Declined Reason'),
			sortingOrder: ['asc', 'desc'],
			comparator: gridHelper.sortingComparator,
			valueGetter: (params: any) => params.data.declinedReason || '-',
		},
		{
			field: 'declinedAt',
			headerName: t('Manage.Appointments.Grid_DeclinedAt', 'Declined At'),
			sortingOrder: ['asc', 'desc'],
			comparator: gridHelper.sortingComparator,
			valueGetter: (params: any) => (params.data.declinedAt ? moment(params.data.declinedAt).format('DD MMM YYYY hh:mm A') : '-'),
		},
	] as any)

	return (
		<PopupWrapper variant="default">
			<PopupHeader title={t('Manage.Appointments.Edit_AppointmentDetails', 'Appointment Details')} onClose={() => props.viewAppointmentOutPut(false)} />

			<PopupBody>
				<div className="grid lg:grid-cols-2 gap-6">
					<div className="lg:col-span-2">
						<Label variant="readonly">{t('Manage.Appointments.Edit_Title', 'Title')}</Label>
						<div className="readonly-field">{modalState.eventDetailData.title || '-'}</div>
					</div>

					{modalState.eventDetailData.description && (
						<div className="lg:col-span-2">
							<Label variant="readonly">{t('Manage.Appointments.Edit_Description', 'Description')}</Label>
							<div className="readonly-field whitespace-pre-wrap">{modalState.eventDetailData.description || '—'}</div>
						</div>
					)}

					<div className="lg:col-span-2 grid lg:grid-cols-3 gap-6">
						{modalState.eventDetailData.durationMinutes && (
							<div>
								<Label variant="readonly">{t('Manage.Appointments.Edit_Duration', 'Duration')}</Label>
								<div className="readonly-field">{modalState.eventDetailData.durationMinutes} minutes</div>
							</div>
						)}

						{modalState.eventDetailData.locationType && (
							<div>
								<Label variant="readonly">{t('Manage.Appointments.Edit_LocationType', 'Location Type')}</Label>
								<div className="readonly-field">{modalState.eventDetailData.locationType}</div>
							</div>
						)}

						{modalState.eventDetailData.appointmentStatus && (
							<div>
								<Label variant="readonly">{t('Manage.Appointments.Edit_Status', 'Status')}</Label>
								<div
									className="readonly-field orbit-status-badge"
									style={
										{
											['--orbit-status-bg' as any]: getAppointmentStatusColor(modalState.eventDetailData.appointmentStatus as AppointmentStatus),
										} as React.CSSProperties
									}
								>
									{modalState.eventDetailData.appointmentStatus}
								</div>
							</div>
						)}
					</div>
					<div className="lg:col-span-2 grid lg:grid-cols-2 gap-6">
						{modalState.eventDetailData.approvalRule && (
							<div>
								<Label variant="readonly">{t('Manage.Appointments.Edit_ApprovalRule', 'Approval Rule')}</Label>
								<div className="readonly-field">{formatHelper.punctuateLabel(modalState.eventDetailData.approvalRule)}</div>
							</div>
						)}

						{modalState.eventDetailData && (
							<div>
								<Label variant="readonly">{t('Manage.Appointments.Edit_MultipleParticipant', 'Multiple Participants')}</Label>
								<div className="readonly-field">{modalState.eventDetailData.multipleParticipantPerSlot}</div>
							</div>
						)}
					</div>

					{modalState.eventDetailData.cancellationReason && (
						<div>
							<Label variant="readonly">{t('Manage.Appointments.Edit_CancellationReason', 'Cancellation Reason')}</Label>
							<div className="readonly-field">{modalState.eventDetailData.cancellationReason}</div>
						</div>
					)}

					{modalState.eventDetailData.cancelledBy && (
						<div>
							<Label variant="readonly">{t('Manage.Appointments.Edit_CancelledBy', 'Cancelled By')}</Label>
							<div className="readonly-field">{modalState.eventDetailData.cancelledBy}</div>
						</div>
					)}

					<div className="lg:col-span-2 grid lg:grid-cols-1 gap-6">
						{modalState.timeSlots.length > 0 && (
							<div>
								<Label variant="readonly" className="mb-2 block">
									{t('Manage.Appointments.Edit_AvailabilityWindows', 'Availability Windows')}
								</Label>
								<div className="space-y-2">
									{modalState.timeSlots.map((slot, idx) => (
										<div key={idx} className="readonly-field">
											<p className="text-sm">
												{moment(slot.onDate).format('DD MMM YYYY')} — {moment(slot.timeFrom, 'HH:mm:ss').format('hh:mm A')} to {moment(slot.timeTo, 'HH:mm:ss').format('hh:mm A')}
											</p>
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					{(modalState.rowData.length > 0 || modalState.host.length > 0) && (
						<div className="lg:col-span-2 grid gap-4">
							{modalState.host.length > 0 && (
								<div>
									<Label variant="readonly" className="mb-2 block">
										{t('Manage.Appointments.Edit_HostParticipants', 'Host Participants')}
									</Label>
									<div className="flex flex-wrap gap-2">
										{modalState.host.map((p, i) => (
											<div key={i} className="flex items-center space-x-1 text-xs orbit-chip-bg rounded px-2 py-1">
												<img src={imageHelper.getUserImage(p.participantDetail.imageUrl)} alt={p.participantDetail.firstName || ''} className="w-5 h-5 rounded-full border border-gray-300" />
												<span>{p.participantDetail.firstName}</span>
												{getStatusIcon(p.appointmentParticipantResponseStatus ?? '')}
											</div>
										))}
									</div>
								</div>
							)}
							<div>
								<Label variant="readonly" className="mb-2 block">
									{t('Manage.Appointments.Edit_Participant', 'Participants')}
								</Label>
								<DataGridWithoutPagination rowData={modalState.rowData} columnDefs={columnDefs} />
							</div>
						</div>
					)}
				</div>
			</PopupBody>
			<PopupFooter>
				<button className="btn btn-secondary" onClick={() => props.viewAppointmentOutPut(false)} type="button">
					{t('Manage.Appointments.Edit_Close', 'Close')}
				</button>
				{modalState.eventDetailData.appointmentStatus !== AppointmentStatus.Cancelled && (
					<button className="btn btn-primary" type="button" onClick={() => setShowCancelConfirmation(true)}>
						{t('Manage.Appointments.Edit_CancelAppointment', 'Cancel Appointment')}
					</button>
				)}
				{modalState.eventDetailData.appointmentStatus !== AppointmentStatus.Rescheduled && (
					<button className="btn btn-primary" type="button" onClick={() => props.onReschedule()}>
						{t('Manage.Appointments.Edit_RescheduleAppointment', 'Reschedule Appointment')}
					</button>
				)}
				{props.id && showCancelConfirmation && (
					<DeleteConfirmation
						isOpen={showCancelConfirmation}
						onClose={() => setShowCancelConfirmation(false)}
						onConfirm={() => {
							setShowCancelConfirmation(false)
							props.onCancelAppointment()
						}}
						title={t('Manage.Appointment.Delete_Title', 'Cancel Appointment')}
						description={t('Manage.Appointment.Delete_Description', 'Are you sure you want to cancel this appointment?')}
						confirmButtonText={t('Manage.Appointment.Delete_Confirm', 'Confirm')}
					/>
				)}
			</PopupFooter>
		</PopupWrapper>
	)
}

export default ViewAppointmentDetail
