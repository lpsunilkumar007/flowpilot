import { MODAL_PANEL_CLASS } from '@/constants'
import { PageBreadcrumbsWithLinks } from '@/components'
import { lazy, useState } from 'react'
import { ModalLayout } from '@/components/HeadlessUI'
import { usePermission } from '@/hooks/usePermission'
import { PermissionTypes } from '@/constants/permissions'
import withSuspense from '@/helpers/suspense.helper'
import { useTranslation } from 'react-i18next'
import { useUsers } from '@/hooks/useUsers'
import { useModalState } from '@/hooks/useModalState'
import { PageBody, PageTitle, PageWrapper } from '@/components/PageWrapper'
import { MenuLinks } from '@/constants/menu'

const ViewUsers = withSuspense(lazy(() => import('./Components/ViewUsers')))
const AddUser = withSuspense(lazy(() => import('./Components/AddUser')))
const EditUser = withSuspense(lazy(() => import('./Components/EditUser')))
const AssignRoles = withSuspense(lazy(() => import('./Components/AssignRoles')))
const ChangeUserPassword = withSuspense(lazy(() => import('@/components/ChangeUserPassword')))

type ModalState = {
	isAddUserVisible: boolean
	isEditUserVisible: boolean
	userToEdit: string
	isAssignRolesVisible: boolean
	isChangeUserPasswordVisible: boolean
}

const ManageUsers = () => {
	const { t } = useTranslation()
	const { userHasPermission } = usePermission()
	const [reloadUsers, setReloadUsers] = useState(false)
	const { users, loading: usersLoading } = useUsers(reloadUsers)
	const {
		modalState,
		toggleModal,
		setKey: setModalKey,
	} = useModalState<ModalState>({
		initialState: {
			isAddUserVisible: false,
			isEditUserVisible: false,
			userToEdit: '',
			isAssignRolesVisible: false,
			isChangeUserPasswordVisible: false,
		},
	})

	const handleAddUserOutput = (isAdded: boolean) => {
		if (isAdded) setReloadUsers((prev) => !prev)
		toggleModal('isAddUserVisible')
	}

	const onActionClick = async (id: string, action: string) => {
		if (action === 'Edit') {
			setModalKey('userToEdit', id)
			setModalKey('isEditUserVisible', true)
		} else if (action === 'AssignRoles') {
			setModalKey('userToEdit', id)
			setModalKey('isAssignRolesVisible', true)
		} else if (action === 'ChangeUserPassword') {
			setModalKey('userToEdit', id)
			setModalKey('isChangeUserPasswordVisible', true)
		}
	}
	const handleEditUserOutput = (isUpdated: boolean) => {
		if (isUpdated) setReloadUsers((prev) => !prev)
		setModalKey('userToEdit', '')
		setModalKey('isEditUserVisible', false)
	}

	const handleAssignRoleOutPut = (isUpdated: boolean) => {
		if (isUpdated) setReloadUsers((prev) => !prev)
		setModalKey('userToEdit', '')
		setModalKey('isAssignRolesVisible', false)
	}

	const handleChangeUserPasswordOutPut = (isChanged: boolean) => {
		if (isChanged) setReloadUsers((prev) => !prev)
		setModalKey('userToEdit', '')
		setModalKey('isChangeUserPasswordVisible', false)
	}

	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.Users_Heading', 'Users')} subNames={[{ label: t('Administrators_Heading', 'Administrators'), link: MenuLinks.ViewAdministratorSubMenu }, { label: t('Manage.Users_Breadcrumb', 'Users') }]} />
			<PageWrapper>
				{userHasPermission(PermissionTypes.Permissions_Users_Create) && (
					<PageTitle
						actions={
							<button onClick={() => toggleModal('isAddUserVisible')} className="btn btn-primary">
								{t('Manage.Users.Grid_Add', 'Add')}
							</button>
						}
					/>
				)}
				<PageBody>
					<ViewUsers onActionClick={onActionClick} rowData={users} loading={usersLoading} />
				</PageBody>
			</PageWrapper>

			<ModalLayout isStatic={true} showModal={modalState.isAddUserVisible} toggleModal={() => toggleModal('isAddUserVisible')} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				<AddUser addNewUserOutPut={handleAddUserOutput} />
			</ModalLayout>

			<ModalLayout isStatic={true} showModal={modalState.isEditUserVisible} toggleModal={() => toggleModal('isEditUserVisible')} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				{modalState.userToEdit && <EditUser editUserOutPut={handleEditUserOutput} id={modalState.userToEdit} />}
			</ModalLayout>

			<ModalLayout isStatic={true} showModal={modalState.isAssignRolesVisible} toggleModal={() => toggleModal('isAssignRolesVisible')} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				{modalState.userToEdit && <AssignRoles assignRoleOutPut={handleAssignRoleOutPut} id={modalState.userToEdit} />}
			</ModalLayout>

			<ModalLayout isStatic={true} showModal={modalState.isChangeUserPasswordVisible} toggleModal={() => toggleModal('isChangeUserPasswordVisible')} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				{modalState.userToEdit && <ChangeUserPassword onUserActionClick={handleChangeUserPasswordOutPut} userId={modalState.userToEdit} variant="popup" />}
			</ModalLayout>
		</>
	)
}

export default ManageUsers
