import { ActionDropdown } from '@/components'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface ViewLocalizationActionButtonsProps {
	id: number
	onActionClick: (id: number, action: string) => void
}

const ViewLocalizationActionButtons: React.FC<ViewLocalizationActionButtonsProps> = ({ id, onActionClick }) => {
	const { t } = useTranslation()

	return (
		<ActionDropdown
			label={t('Manage.Localization.Actions_Actions', 'Actions')}
			items={[
				{
					key: 'edit',
					label: t('Manage.Localization.Actions_Edit', 'Edit'),
					onClick: () => onActionClick(id, 'Edit'),
				},
			]}
			menuWidth={140}
			menuHeight={120}
			minWidthPx={140}
		/>
	)
}

export default ViewLocalizationActionButtons
