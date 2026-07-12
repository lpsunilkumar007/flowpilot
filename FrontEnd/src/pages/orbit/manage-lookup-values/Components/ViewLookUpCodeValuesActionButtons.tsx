import { ActionDropdown } from '@/components'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface ViewLookUpCodeValuesActionButtonsProps {
	id: number
	onActionClick: (id: number, actiontype: string) => void
}

const ViewLookUpCodeValuesActionButtons: React.FC<ViewLookUpCodeValuesActionButtonsProps> = (props) => {
	const { t } = useTranslation()

	return (
		<ActionDropdown
			label={t('Manage.Values.Actions_Actions', 'Actions')}
			items={[
				{
					key: 'edit',
					label: t('Manage.Values.Actions_Edit', 'Edit'),
					onClick: () => props.onActionClick(props.id, 'Edit'),
				},
			]}
		/>
	)
}

export default ViewLookUpCodeValuesActionButtons
