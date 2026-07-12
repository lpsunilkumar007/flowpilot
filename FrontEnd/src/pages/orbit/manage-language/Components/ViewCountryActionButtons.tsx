import { ActionDropdown } from '@/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { MenuLinks } from '@/constants/menu'

interface ViewCountryActionButtonsProps {
	id: number
	onActionClick: (id: number, action: string) => void
}

const ViewCountryActionButtons: React.FC<ViewCountryActionButtonsProps> = ({ id, onActionClick }) => {
	const { t } = useTranslation()
	const navigate = useNavigate()

	const handleView = () => navigate(MenuLinks.ManageLanguageLocalizations.replace(':countryId', id.toString()))

	return (
		<ActionDropdown
			label={t('Manage.Languages.Actions_Actions', 'Actions')}
			items={[
				{
					key: 'edit',
					label: t('Manage.Languages.Actions_Edit', 'Edit'),
					onClick: () => onActionClick(id, 'Edit'),
				},
				{
					key: 'view',
					label: t('Manage.Languages.Actions_View', 'View'),
					onClick: () => handleView(),
				},
				{
					key: 'delete',
					label: t('Manage.Languages.Actions_Delete', 'Delete'),
					onClick: () => onActionClick(id, 'Delete'),
					className: 'action-menu-item action-menu-item--danger',
				},
			]}
			menuWidth={140}
			menuHeight={140}
			minWidthPx={140}
		/>
	)
}

export default ViewCountryActionButtons
