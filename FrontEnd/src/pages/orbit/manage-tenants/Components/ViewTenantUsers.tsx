import DataGridWithoutPagination from '@/components/DataGrid/DataGridWithoutPagination'
import { ModalLayout } from '@/components/HeadlessUI'
import { MODAL_PANEL_CLASS } from '@/constants'
import { ViewUserDetailsResponse } from '@/helpers/api/WebApiClient'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { gridHelper } from '@/helpers/grid.helper'
import withSuspense from '@/helpers/suspense.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { multiTenantService } from '@/services/MultiTenantService'
import React, { lazy, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const EditUser = withSuspense(lazy(() => import('../../manage-users/Components/EditUser')))
const ViewTenantUserActionButtons = withSuspense(lazy(() => import('./ViewTenantUserActionButtons')))
const ChangeUserPassword = withSuspense(lazy(() => import('@/components/ChangeUserPassword')))

interface ViewTenantUsersProps {
	id: string
}

type ModalState = {
	isEditUserVisible: boolean
	userToEdit: string
	reloadUsers: boolean
	isChangeUserPasswordVisible: boolean
}
const ViewTenantUsers: React.FC<ViewTenantUsersProps> = (props) => {
	const { t } = useTranslation()
	const [rowData, setRowData] = useState<ViewUserDetailsResponse[]>([])
	const [loading, setLoading] = useState<boolean>(false)
	const loadingIndicator = () => <AnimationSkeleton />
	const [modalState, setModalState] = useState<ModalState>({
		isEditUserVisible: false,
		userToEdit: '',
		reloadUsers: false,
		isChangeUserPasswordVisible: false,
	})

	const toggleModal = (modalName: keyof ModalState) => {
		setModalState((prev) => ({
			...prev,
			[modalName]: !prev[modalName],
		}))
	}

	const handleEditUserOutput = (isUpdated: boolean) => {
		if (isUpdated) toggleModal('reloadUsers')
		setModalState((prev) => ({ ...prev, userToEdit: '', isEditUserVisible: false }))
	}

	const handleChangeUserPasswordOutPut = (isChanged: boolean) => {
		if (isChanged) toggleModal('reloadUsers')
		setModalState((prev) => ({ ...prev, userToEdit: '', isChangeUserPasswordVisible: false }))
	}

	const onActionClick = async (id: string, action: string) => {
		if (action === 'Edit') {
			setModalState((prev) => ({ ...prev, userToEdit: id, isEditUserVisible: true }))
		} else if (action === 'ChangePassword') {
			setModalState((prev) => ({ ...prev, userToEdit: id, isChangeUserPasswordVisible: true }))
		}
	}

	const fetchData = async () => {
		await runWithToast(
			async () => {
				const response = await multiTenantService.getTenantUsers(Number(props.id))
				setRowData(response)
				return response
			},
			{ setLoading }
		)
	}

	useEffect(() => {
		fetchData()
	}, [props.id, modalState.reloadUsers])

	const [columnDefs] = useState([
		{
			headerName: t('Manage.Users.Grid_Name', 'Name'),
			sort: 'asc',
			valueGetter: (params: any) => `${params.data.firstName || ''} ${params.data.lastName || ''}`,
			sortingOrder: ['asc', 'desc'],
			comparator: gridHelper.sortingComparator,
			minWidth: 200,
		},
		{ field: 'email', headerName: t('Manage.Users.Grid_EmailAddress', 'Email Address'), sortingOrder: ['asc', 'desc'], comparator: gridHelper.sortingComparator, minWidth: 200 },
		{
			sortable: false,
			field: 'isActive',
			headerName: t('Manage.Users.Grid_Status', 'Status'),
			cellRenderer: (params: any) => {
				const isActive: boolean = params.value
				const emailConfirmed: boolean = params.data.emailConfirmed
				return (
					<div>
						<span className={`ml-2 ${isActive ? 'orbit-pill orbit-pill--success' : 'orbit-pill orbit-pill--danger'}`}>{isActive ? 'Active' : 'Inactive'}</span>
						<span className={`ml-2 ${emailConfirmed ? 'orbit-pill orbit-pill--success' : 'orbit-pill orbit-pill--neutral'}`}>{emailConfirmed ? 'Email Confirmed' : 'Email Not Confirmed'}</span>
					</div>
				)
			},
			minWidth: 200,
		},
		{
			field: 'id',
			sortable: false,
			headerName: t('Manage.Users.Grid_Actions', 'Actions'),
			cellClass: 'actions',
			minWidth: 250,
			flex: 1,
			cellRenderer: (params: any) => <ViewTenantUserActionButtons id={params.data.id} onActionClick={onActionClick} />,
		},
	] as any)

	return (
		<>
			{loading && loadingIndicator()}
			{!loading && <DataGridWithoutPagination rowData={rowData} columnDefs={columnDefs} />}

			<ModalLayout isStatic={true} showModal={modalState.isEditUserVisible} toggleModal={() => toggleModal('isEditUserVisible')} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				{modalState.userToEdit && <EditUser editUserOutPut={handleEditUserOutput} id={modalState.userToEdit} />}
			</ModalLayout>
			<ModalLayout isStatic={true} showModal={modalState.isChangeUserPasswordVisible} toggleModal={() => toggleModal('isChangeUserPasswordVisible')} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				{modalState.userToEdit && <ChangeUserPassword onUserActionClick={handleChangeUserPasswordOutPut} userId={modalState.userToEdit} variant="popup" />}
			</ModalLayout>
		</>
	)
}

export default ViewTenantUsers
