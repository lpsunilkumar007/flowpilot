import { PageBreadcrumbsWithLinks } from '@/components'
import React, { lazy, useState } from 'react'
import withSuspense from '@/helpers/suspense.helper'
import { ModalLayout } from '@/components/HeadlessUI'
import { useTranslation } from 'react-i18next'
import { PermissionTypes } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'
import { MODAL_PANEL_CLASS } from '@/constants'
import { PageBody, PageTitle, PageWrapper } from '@/components/PageWrapper'
const AddAppointmentEvent = withSuspense(lazy(() => import('./Components/AddAppointment')))
const RescheduleAppointment = withSuspense(lazy(() => import('./Components/RescheduleAppointment')))
const ViewAppointmentDetail = withSuspense(lazy(() => import('./Components/ViewAppointmentDetail')))
const ViewAppointment = withSuspense(lazy(() => import('./Components/ViewAppointment')))
const CancelAppointmentEvent = withSuspense(lazy(() => import('./Components/CancelAppointment')))

type ModalState = {
	isAddEventVisible: boolean
	isViewEventVisible: boolean
	isRescheduleVisible: boolean
	selectedAppointmentId?: number
	isCancelAppointmentVisible: boolean
}

const ManageAppointment: React.FC = () => {
	const { t } = useTranslation()
	const { userHasPermission } = usePermission()
	const [modalState, setModalState] = useState<ModalState>({
		isAddEventVisible: false,
		isViewEventVisible: false,
		isRescheduleVisible: false,
		selectedAppointmentId: undefined,
		isCancelAppointmentVisible: false,
	})
	const [reloadAppointments, setReloadAppointments] = useState<boolean>(false)

	const assignValueToModal = (modalName: keyof ModalState, value: any) => {
		setModalState((prev) => ({
			...prev,
			[modalName]: value,
		}))
	}
	const handleAddAppointmentOutput = (isClosed: boolean) => {
		if (isClosed) {
			setReloadAppointments((prev) => !prev)
		}
		assignValueToModal('isAddEventVisible', !modalState.isAddEventVisible)
	}
	const handleViewAppointmentOutput = (isClosed: boolean) => {
		if (isClosed) {
			setReloadAppointments((prev) => !prev)
		}
		assignValueToModal('isViewEventVisible', !modalState.isViewEventVisible)
	}

	const handleRescheduleAppointmentOutput = (isClosed: boolean) => {
		if (!isClosed) {
			setReloadAppointments((prev) => !prev)
		}
		assignValueToModal('isRescheduleVisible', !modalState.isRescheduleVisible)
	}

	const handleCancelAppointmentOutput = (isClosed: boolean) => {
		if (isClosed) {
			setReloadAppointments((prev) => !prev)
		}
		assignValueToModal('isCancelAppointmentVisible', !modalState.isCancelAppointmentVisible)
	}

	const openRescheduleModal = () => {
		assignValueToModal('isViewEventVisible', false)
		assignValueToModal('isRescheduleVisible', true)
	}
	const openCancelAppointmentModal = () => {
		assignValueToModal('isViewEventVisible', false)
		assignValueToModal('isCancelAppointmentVisible', true)
	}

	const onEventClick = async (clickedEventId: number) => {
		assignValueToModal('selectedAppointmentId', clickedEventId)
		assignValueToModal('isViewEventVisible', true)
	}
	const onActionResClick = () => openRescheduleModal()
	const onActionCancelAppointmentClick = () => openCancelAppointmentModal()
	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.Appointments_Heading', 'Appointments')} subNames={[{ label: t('Manage.Appointments_Breadcrumb', 'Appointments') }]} />

			<PageWrapper>
				{userHasPermission(PermissionTypes.Permissions_ManageAppointments_Create) && (
					<PageTitle
						actions={
							<button onClick={() => assignValueToModal('isAddEventVisible', true)} className="btn btn-primary">
								{t('Manage.Appointments.Grid_Add', 'Add')}
							</button>
						}
					/>
				)}
				<PageBody>
					<ViewAppointment onActionClick={() => assignValueToModal('isAddEventVisible', true)} onEventClick={onEventClick} refreshData={reloadAppointments} />
				</PageBody>
			</PageWrapper>

			<ModalLayout isStatic={true} showModal={modalState.isAddEventVisible} toggleModal={() => assignValueToModal('isAddEventVisible', !modalState.isAddEventVisible)} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				<AddAppointmentEvent addNewAppointmentOutPut={handleAddAppointmentOutput} />
			</ModalLayout>

			<ModalLayout isStatic={true} showModal={modalState.isViewEventVisible} toggleModal={() => assignValueToModal('isViewEventVisible', !modalState.isViewEventVisible)} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				<ViewAppointmentDetail viewAppointmentOutPut={handleViewAppointmentOutput} id={modalState.selectedAppointmentId} onReschedule={onActionResClick} onCancelAppointment={onActionCancelAppointmentClick} />
			</ModalLayout>

			<ModalLayout isStatic={true} showModal={modalState.isRescheduleVisible} toggleModal={() => assignValueToModal('isRescheduleVisible', !modalState.isRescheduleVisible)} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				{modalState.selectedAppointmentId && <RescheduleAppointment rescheduleAppointmentOutPut={handleRescheduleAppointmentOutput} id={modalState.selectedAppointmentId} />}
			</ModalLayout>

			<ModalLayout isStatic={true} showModal={modalState.isCancelAppointmentVisible} toggleModal={() => assignValueToModal('isCancelAppointmentVisible', !modalState.isCancelAppointmentVisible)} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				{modalState.selectedAppointmentId && <CancelAppointmentEvent cancelAppointmentOutPut={handleCancelAppointmentOutput} id={modalState.selectedAppointmentId} />}
			</ModalLayout>
		</>
	)
}

export default ManageAppointment
