import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ViewSettings from './Components/ViewSettings'
import { SettingTypes } from '@/helpers/api/WebApiClient'
import { MenuLinks } from '@/constants/menu'

type ModalState = {
	isRedirectSettings: boolean
	id: number
	settingType?: SettingTypes
}

const ManageSettings: React.FC = () => {
	const navigate = useNavigate()

	const [modalState, setModalState] = useState<ModalState>({
		isRedirectSettings: false,
		id: 0,
	})
	const onActionClick = async (id: number, action: string, settingType: SettingTypes) => {
		if (action === 'Edit') {
			setModalState((prev) => ({ ...prev, id: id, settingType: settingType, isRedirectSettings: true }))
		}
	}

	useEffect(() => {
		if (modalState.settingType && modalState.isRedirectSettings) {
			if (modalState.settingType === SettingTypes.Appointment) {
				navigate(MenuLinks.ManageAppointmentSettings.replace(':id', String(modalState.id)))
			}
			if (modalState.settingType === SettingTypes.ApprovedAppointment) {
				navigate(MenuLinks.ApprovedAppointmentSettings.replace(':id', String(modalState.id)))
			}
		}
	}, [modalState.isRedirectSettings])

	return (
		<>
			<ViewSettings onActionClick={onActionClick} />
		</>
	)
}

export default ManageSettings
