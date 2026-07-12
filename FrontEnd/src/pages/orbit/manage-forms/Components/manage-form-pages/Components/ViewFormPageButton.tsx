import { PermissionTypes } from '@/constants/permissions'
import { useTranslation } from 'react-i18next'
import { ActionDropdown } from '@/components'
interface ViewFormActionButtonProps {
	id: number
	onActionClick: (id: number, action: string) => void
}

const ViewFormPageActionButton: React.FC<ViewFormActionButtonProps> = (props) => {
	const { t } = useTranslation()
	return (
		<ActionDropdown
			label={t('Manage.Form.FormPages.Actions_Actions', 'Actions')}
			items={[
				{
					key: 'edit',
					label: t('Manage.Form.FormPages.Action_Edit', 'Edit'),
					onClick: () => props.onActionClick(props.id, 'EditPage'),
				},
				{
					key: 'tabs',
					label: t('Manage.Form.FormPages.Action_ManageFormPageTabs', 'Manage Form Page Tabs'),
					onClick: () => props.onActionClick(props.id, 'ManageFormPageTabs'),
				},
				{
					key: 'fields',
					label: t('Manage.Form.FormPages.Action_ManageField', 'Manage Fields'),
					onClick: () => props.onActionClick(props.id, 'ManageFields'),
				},
				{
					key: 'delete',
					label: t('Manage.Form.FormPages.Action_Delete', 'Delete'),
					onClick: () => props.onActionClick(props.id, 'DeletePage'),
					permission: PermissionTypes.Permissions_ManageForm_Delete,
					className: 'action-menu-item action-menu-item--danger',
				},
			]}
			menuHeight={160}
		/>
	)
}

export default ViewFormPageActionButton
