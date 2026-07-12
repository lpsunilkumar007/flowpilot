import { NexusLookUpCodeTypes } from '@/helpers/api/WebApiClient'
import { ActionDropdown } from '@/components'
import { useTranslation } from 'react-i18next'

interface ViewNexusLookUpCodesActionButtonsProps {
	onActionClick: (id: number, actiontype: string, lookUpCodeType: NexusLookUpCodeTypes) => void
	id: number
	nexusLookUpCodeType: NexusLookUpCodeTypes
}
const ViewNexusLookUpCodesActionButtons: React.FC<ViewNexusLookUpCodesActionButtonsProps> = (props) => {
	const { t } = useTranslation()
	return (
		<ActionDropdown
			label={t('Manage.Nexus.Lookups.Actions_Actions', 'Actions')}
			items={[
				{
					key: 'viewValues',
					label: t('Manage.Nexus.Lookups.Actions_ViewValues', 'View Values'),
					onClick: () => props.onActionClick(props.id, 'ViewValues', props.nexusLookUpCodeType),
				},
			]}
		/>
	)
}

export default ViewNexusLookUpCodesActionButtons
