import { LookUpCodeTypes } from '@/helpers/api/WebApiClient'
import { ActionDropdown } from '@/components'
import { useTranslation } from 'react-i18next'

interface ViewLookUpCodesActionButtonsProps {
	onActionClick: (id: number, actiontype: string, lookUpCodeType: LookUpCodeTypes) => void
	id: number
	lookUpCodeType: LookUpCodeTypes
}

const ViewLookUpCodesActionButtons: React.FC<ViewLookUpCodesActionButtonsProps> = (props) => {
	const { t } = useTranslation()
	return (
		<ActionDropdown
			label={t('Manage.Lookups.Actions_Actions', 'Actions')}
			items={[
				{
					key: 'viewValues',
					label: t('Manage.Lookups.Actions_ViewValues', 'View Values'),
					onClick: () => props.onActionClick(props.id, 'ViewValues', props.lookUpCodeType),
				},
			]}
		/>
	)
}

export default ViewLookUpCodesActionButtons
