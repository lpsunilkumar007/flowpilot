import { ActionDropdown } from '@/components'
import { useTranslation } from 'react-i18next'

interface ViewTenantActionButtonProp {
	onActionClick: (id: string, actiontype: string) => void
	id: string
}

const ViewTenantUserActionButtons: React.FC<ViewTenantActionButtonProp> = (props) => {
	const { t } = useTranslation()

	return (
		<ActionDropdown
			label={t('Manage.Tenants.Grid.Actions_Actions', 'Actions')}
			items={[
				{
					key: 'edit',
					label: t('Manage.Tenants.Grid.Actions_Edit', 'Edit'),
					onClick: () => props.onActionClick(props.id, 'Edit'),
				},
				{
					key: 'changePassword',
					label: t('Manage.Tenants.Grid.Actions_ChangePassword', 'Change Password'),
					onClick: () => props.onActionClick(props.id, 'ChangePassword'),
				},
			]}
			menuHeight={120}
		/>
	)
}

export default ViewTenantUserActionButtons
