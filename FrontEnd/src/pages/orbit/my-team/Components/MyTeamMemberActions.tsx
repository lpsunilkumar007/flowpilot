import { ActionDropdown } from '@/components'
import { useTranslation } from 'react-i18next'

interface MyTeamMemberActionsProps {
	userId: string
	onActionClick: (userId: string, action: string) => void
}

const MyTeamMemberActions: React.FC<MyTeamMemberActionsProps> = ({ userId, onActionClick }) => {
	const { t } = useTranslation()

	return (
		<ActionDropdown
			label={t('Manage.MyTeam.Actions_Actions', 'Actions')}
			items={[
				{
					key: 'viewLeads',
					label: t('Manage.MyTeam.Actions_ViewLeads', 'View Leads'),
					onClick: () => onActionClick(userId, 'ViewLeads'),
				},
				{
					key: 'viewTasks',
					label: t('Manage.MyTeam.Actions_ViewTasks', 'View Tasks'),
					onClick: () => onActionClick(userId, 'ViewTasks'),
				},
			]}
			menuHeight={100}
		/>
	)
}

export default MyTeamMemberActions
