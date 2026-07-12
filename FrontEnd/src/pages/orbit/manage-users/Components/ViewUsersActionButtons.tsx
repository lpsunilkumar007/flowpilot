import { ActionDropdown } from '@/components'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface ViewUsersActionButtonsProp {
	onActionClick: (id: string, actiontype: string) => void
	id: string
}

const ViewUsersActionButtons: React.FC<ViewUsersActionButtonsProp> = (props) => {
	const { t } = useTranslation()

	return (
		<ActionDropdown
			label={t('Manage.Users.Actions_Actions', 'Actions')}
			items={[
				{
					key: 'edit',
					label: t('Manage.Users.Actions_Edit', 'Edit'),
					onClick: () => props.onActionClick(props.id, 'Edit'),
				},
				{
					key: 'assignRoles',
					label: t('Manage.Users.Actions_AssignRoles', 'Assign Roles'),
					onClick: () => props.onActionClick(props.id, 'AssignRoles'),
				},
				{
					key: 'changePassword',
					label: t('Manage.Users.Actions_ChangePassword', 'Change Password'),
					onClick: () => props.onActionClick(props.id, 'ChangeUserPassword'),
				},
			]}
			menuHeight={120}
		/>
	)
}
export default ViewUsersActionButtons