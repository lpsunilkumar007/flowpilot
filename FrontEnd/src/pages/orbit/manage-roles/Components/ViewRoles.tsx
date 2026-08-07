import DataGridWithoutPagination from '@/components/DataGrid/DataGridWithoutPagination'
import { RoleDto } from '@/helpers/api/WebApiClient'
import { gridHelper } from '@/helpers/grid.helper'
import withSuspense from '@/helpers/suspense.helper'
import { formatRoleDisplayName } from '@/pages/orbit/manage-users/helpers/userRoles.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { lazy, useState } from 'react'
import { useTranslation } from 'react-i18next'
const ViewRolesActionButtons = withSuspense(lazy(() => import('./ViewRolesActionButtons')))

interface ViewRolesProps {
	onActionClick: (id: string, action: string) => void
	rowData: RoleDto[]
	loading: boolean
}

const ViewRoles: React.FC<ViewRolesProps> = (props) => {
	const { t } = useTranslation()

	const loadingIndicator = () => <AnimationSkeleton />
	const [columnDefs] = useState([
		{
			field: 'name',
			headerName: t('Manage.Role.Grid_RoleName', 'Role Name'),
			sortingOrder: ['asc', 'desc'],
			sort: 'asc',
			comparator: gridHelper.sortingComparator,
			minWidth: 200,
			valueFormatter: (params: { value?: string }) => formatRoleDisplayName(params.value),
		},
		{ field: 'description', headerName: t('Manage.Role.Grid_Description'), sortable: false, minWidth: 200 },
		{
			field: 'id',
			sortable: false,
			headerName: t('Manage.Role.Grid_Actions', 'Actions'),
			cellClass: 'actions',
			minWidth: 250,
			flex: 1,
			cellRenderer: (params: { data: { id: string } }) => <ViewRolesActionButtons onActionClick={props.onActionClick} id={params.data.id} />,
		},
	] as any)

	return (
		<>
			{props.loading && loadingIndicator()}
			{!props.loading && <DataGridWithoutPagination rowData={props.rowData} columnDefs={columnDefs} />}
		</>
	)
}

export default ViewRoles
