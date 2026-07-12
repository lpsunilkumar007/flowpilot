import { PermissionTypes } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'
import React from 'react'

interface ViewFormPageTabActionButtonProps {
	tabId: number
	onActionClick: (id: number, action: string) => void
}

const ViewFormPageTabActionButton: React.FC<ViewFormPageTabActionButtonProps> = (props) => {
	const { userHasPermission } = usePermission()

	return (
		<>
			<div className="flex items-center gap-1">
				<button
					type="button"
					onClick={() => {
						props.onActionClick(props.tabId, 'EditFormPageTab')
					}}
					className="flex items-center gap-2 px-3 py-2 text-sm orbit-label-secondary transition rounded-md hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
				>
					<i className="ri-edit-line text-base" />
				</button>

				{userHasPermission(PermissionTypes.Permissions_ManageForm_Delete) && (
					<button type="button" onClick={() => props.onActionClick(props.tabId, 'DeleteFormPageTab')} className="flex items-center gap-2 px-3 py-2 text-sm transition rounded-md hover:bg-red-50 action-menu-item--danger">
						<i className="ri-delete-bin-line text-base" />
					</button>
				)}
			</div>
		</>
	)
}

export default ViewFormPageTabActionButton
