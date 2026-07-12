import { ActionDropdown } from '@/components'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface ViewNexusLookUpCodeValuesActionButtonsProps {
	id: number
	onActionClick: (id: number, actiontype: string) => void
}

const ViewNexusLookUpCodeValuesActionButtons: React.FC<ViewNexusLookUpCodeValuesActionButtonsProps> = (props) => {
	const { t } = useTranslation()
	return (
		<ActionDropdown
			label={t('Manage.Nexus.Values.Actions_Actions', 'Actions')}
			items={[
				{
					key: 'edit',
					label: t('Manage.Nexus.Values.Actions_Edit', 'Edit'),
					onClick: () => props.onActionClick(props.id, 'Edit'),
				},
			]}
		/>
	)
}

export default ViewNexusLookUpCodeValuesActionButtons
