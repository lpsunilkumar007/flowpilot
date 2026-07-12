import { ActionDropdown } from '@/components'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface ViewTenantActionButtonProp {
	onActionClick: (id: string, actiontype: string) => void
	id: string
}

const ViewTenantActionButtons: React.FC<ViewTenantActionButtonProp> = (props) => {
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
			]}
		/>
	)
}

export default ViewTenantActionButtons
