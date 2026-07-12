import DeleteConfirmation from '@/components/DeleteConfirmation'
import { PermissionTypes } from '@/constants/permissions'
import { ActionDropdown } from '@/components'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ViewRolesActionButtonsProps {
	id: string
	onActionClick: (id: string, actiontype: string) => void
}

const ViewRolesActionButtons: React.FC<ViewRolesActionButtonsProps> = (props) => {
	const { t } = useTranslation()
	const [idToDelete, setIdToDelete] = useState('')
	const [isModalOpen, setIsModalOpen] = useState(false)

	const onRoleDelete = async (id: string) => {
		setIdToDelete(id)
		toggleModal()
	}

	const handleDelete = async () => {
		props.onActionClick(props.id, 'Delete')
		toggleModal()
		setIdToDelete('')
	}

	const toggleModal = () => {
		setIsModalOpen((prev) => !prev)
	}

	return (
		<>
			<ActionDropdown
				label={t('Manage.Role.Actions_Actions', 'Actions')}
				items={[
					{
						key: 'edit',
						label: t('Manage.Role.Actions_Edit', 'Edit'),
						onClick: () => props.onActionClick(props.id, 'Edit'),
					},
					{
						key: 'managePermission',
						label: t('Manage.Role.Actions_ManagePermission', 'Manage Permissions'),
						onClick: () => props.onActionClick(props.id, 'ManagePermission'),
					},
					{
						key: 'delete',
						label: t('Manage.Role.Actions_Delete', 'Delete'),
						onClick: () => onRoleDelete(props.id),
						permission: PermissionTypes.Permissions_Roles_Delete,
					},
				]}
				menuHeight={120}
			/>

			{idToDelete && isModalOpen && (
				<DeleteConfirmation
					isOpen={isModalOpen}
					onClose={toggleModal}
					onConfirm={handleDelete}
					title={t('Manage.Role.Delete_Title', 'Delete Role')}
					description={t('Manage.Role.Delete_Description', 'Are you sure you want to delete this role?')}
					confirmButtonText={t('Manage.Role.Delete_ConfirmBtn', 'Delete')}
				/>
			)}
		</>
	)
}

export default ViewRolesActionButtons
