import { SettingTypes } from '@/helpers/api/WebApiClient'
import React from 'react'

interface ViewSettingsListActionButtonProps {
	onActionClick: (id: number, actiontype: string, settingType: SettingTypes) => void
	id: number
	settingType: SettingTypes
}

const ViewSettingsListActionButton: React.FC<ViewSettingsListActionButtonProps> = (props) => {
	return (
		<>
			{
				<div className="flex gap-2">
					<button type="button" onClick={() => props.onActionClick(props.id, 'Edit', props.settingType)} className="btn btn-primary w-8 h-8 rounded mt-1" title="Edit">
						<i className="ri-pencil-fill text-lg"></i>
					</button>
				</div>
			}
		</>
	)
}

export default ViewSettingsListActionButton
