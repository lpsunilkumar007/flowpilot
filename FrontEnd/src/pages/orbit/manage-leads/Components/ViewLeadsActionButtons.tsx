import { MenuLinks } from '@/constants/menu'
import { PermissionTypes } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'
import { useNavigate } from 'react-router-dom'

interface ViewLeadsActionButtonsProps {
	id: number
}

const ViewLeadsActionButtons: React.FC<ViewLeadsActionButtonsProps> = ({ id }) => {
	const navigate = useNavigate()
	const { userHasPermission } = usePermission()

	if (!userHasPermission(PermissionTypes.Permissions_ManageLeads_View)) return null

	return (
		<button type="button" className="btn btn-sm btn-soft-primary" onClick={() => navigate(MenuLinks.EditLead.replace(':id', String(id)))}>
			View
		</button>
	)
}

export default ViewLeadsActionButtons
