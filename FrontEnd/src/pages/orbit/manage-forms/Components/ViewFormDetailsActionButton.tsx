import { MenuLinks } from '@/constants/menu'
import { PermissionTypes } from '@/constants/permissions'
import { ActionDropdown } from '@/components'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
interface ViewFormActionButtonProps {
	id: number
	onActionClick: (id: number, action: string) => void
}

const ViewFormActionButton: React.FC<ViewFormActionButtonProps> = (props) => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	return (
		<ActionDropdown
			label={t('Manage.Forms.Actions_Actions', 'Actions')}
			items={[
				{
					key: 'edit',
					label: t('Manage.Forms.Action_Edit', 'Edit'),
					onClick: () => navigate(MenuLinks.EditFormLandingPage.replace(':id', String(props.id))),
				},
				{
					key: 'delete',
					label: t('Manage.Forms.Action_Delete', 'Delete'),
					onClick: () => props.onActionClick(props.id, 'Delete'),
					permission: PermissionTypes.Permissions_ManageForm_Delete,
					className: 'action-menu-item action-menu-item--danger',
				},
			]}
			menuHeight={120}
		/>
	)
}

export default ViewFormActionButton
