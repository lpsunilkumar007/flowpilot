import { ActionDropdown } from '@/components'
import { useTranslation } from 'react-i18next'

interface ViewEmailLogActionButtonsProps {
	onActionClick: (id: number, actiontype: string) => void
	id: number
}

const ViewEmailLogActionButtons: React.FC<ViewEmailLogActionButtonsProps> = (props) => {
	const { t } = useTranslation()

	return (
		<ActionDropdown
			label={t('Manage.EmailLog.Actions_Actions', 'Actions')}
			items={[
				{
					key: 'view',
					label: t('Manage.EmailLog.Actions_ViewEmailLog', 'View Email Log'),
					onClick: () => props.onActionClick(props.id, 'ViewEmailLogDetails'),
				},
			]}
		/>
	)
}

export default ViewEmailLogActionButtons
