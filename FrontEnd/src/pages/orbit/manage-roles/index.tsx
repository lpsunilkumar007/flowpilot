import { MODAL_PANEL_CLASS } from '@/constants'
import { PageBreadcrumbsWithLinks } from '@/components'
import { ModalLayout } from '@/components/HeadlessUI'
import { PermissionTypes } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'
import { useRoles } from '@/hooks/useRoles'
import { lazy, useState } from 'react'
import withSuspense from '@/helpers/suspense.helper'
import { useTranslation } from 'react-i18next'
import { roleService } from '@/services/RoleService'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { PageBody, PageTitle, PageWrapper } from '@/components/PageWrapper'
import { MenuLinks } from '@/constants/menu'

const ViewRoles = withSuspense(lazy(() => import('./Components/ViewRoles')))
const AddRole = withSuspense(lazy(() => import('./Components/AddRole')))
const EditRole = withSuspense(lazy(() => import('./Components/EditRole')))
const ManageRolePermissions = withSuspense(lazy(() => import('./Components/ManageRolePermissions')))

type ModalState = {
	isAddRoleVisible: boolean
	isEditRoleVisible: boolean
	isManagePermissionVisible: boolean
	roleToEdit: string
}

const ManageRoles = () => {
	const { userHasPermission } = usePermission()
	const [reloadRoles, setReloadRoles] = useState(false)
	const { roles, loading: rolesLoading } = useRoles(reloadRoles)
	const [modalState, setModalState] = useState<ModalState>({
		isAddRoleVisible: false,
		isEditRoleVisible: false,
		isManagePermissionVisible: false,
		roleToEdit: '',
	})

	const toggleModal = (modalName: keyof ModalState) => {
		setModalState((prev) => ({
			...prev,
			[modalName]: !prev[modalName],
		}))
	}

	const onActionClick = async (id: string, action: string) => {
		if (action === 'Edit') {
			setModalState((prev) => ({ ...prev, roleToEdit: id, isEditRoleVisible: true }))
		} else if (action === 'ManagePermission') {
			setModalState((prev) => ({ ...prev, roleToEdit: id, isManagePermissionVisible: true }))
		} else if (action === 'Delete') {
			await runWithToast(() => roleService.delete(id), {
				onSuccess: () => {
					messageHelper.showSuccess('Role deleted successfully')
					setReloadRoles((prev) => !prev)
				},
			})
		}
	}

	const handleAddRoleOutput = (isAdded: boolean) => {
		if (isAdded) setReloadRoles((prev) => !prev)
		toggleModal('isAddRoleVisible')
	}

	const handleEditRoleOutput = (isUpdated: boolean) => {
		if (isUpdated) setReloadRoles((prev) => !prev)
		setModalState((prev) => ({ ...prev, roleToEdit: '', isEditRoleVisible: false }))
	}

	const handleEditRolePermissionOutPut = (isUpdated: boolean) => {
		if (isUpdated) setReloadRoles((prev) => !prev)
		setModalState((prev) => ({ ...prev, roleToEdit: '', isManagePermissionVisible: false }))
	}

	const { t } = useTranslation()

	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.Role_Heading', 'Roles')} subNames={[{ label: t('Administrators_Heading', 'Administrators'), link: MenuLinks.ViewAdministratorSubMenu }, { label: t('Manage.Role_Breadcrumb', 'Roles') }]} />

			<PageWrapper>
				{userHasPermission(PermissionTypes.Permissions_Roles_Create) && (
					<PageTitle
						actions={
							<button onClick={() => toggleModal('isAddRoleVisible')} className="btn btn-primary">
								{t('Manage.Role.Grid_Add', 'Add')}
							</button>
						}
					/>
				)}
				<PageBody>
					<ViewRoles onActionClick={onActionClick} rowData={roles} loading={rolesLoading} />
				</PageBody>
			</PageWrapper>

			<ModalLayout isStatic={true} showModal={modalState.isAddRoleVisible} toggleModal={() => toggleModal('isAddRoleVisible')} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				<AddRole addNewRoleOutPut={handleAddRoleOutput} />
			</ModalLayout>

			<ModalLayout isStatic={true} showModal={modalState.isEditRoleVisible} toggleModal={() => toggleModal('isEditRoleVisible')} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				{modalState.roleToEdit && <EditRole editRoleOutPut={handleEditRoleOutput} id={modalState.roleToEdit} />}
			</ModalLayout>

			<ModalLayout isStatic={true} showModal={modalState.isManagePermissionVisible} toggleModal={() => toggleModal('isManagePermissionVisible')} panelClassName={MODAL_PANEL_CLASS} placement="justify-center items-start">
				{modalState.roleToEdit && <ManageRolePermissions editRolePermissionOutPut={handleEditRolePermissionOutPut} id={modalState.roleToEdit} />}
			</ModalLayout>
		</>
	)
}

export default ManageRoles
