import DataGridWithoutPagination from '@/components/DataGrid/DataGridWithoutPagination'
import { ViewUserDetailsResponse } from '@/helpers/api/WebApiClient'
import { gridHelper } from '@/helpers/grid.helper'
import withSuspense from '@/helpers/suspense.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import React, { lazy, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { resolveReportsToName } from '../helpers/userRoles.helper'
const ViewUsersActionButtons = withSuspense(lazy(() => import('./ViewUsersActionButtons')))

interface ViewUsersProps {
	onActionClick: (id: string, action: string) => void
	rowData: ViewUserDetailsResponse[]
	loading: boolean
}

const ViewUsers: React.FC<ViewUsersProps> = (props) => {
	const { t } = useTranslation()

	const loadingIndicator = () => <AnimationSkeleton />

	const columnDefs = useMemo(
		() =>
			[
				{
					headerName: t('Manage.Users.Grid_Name', 'Name'),
					sort: 'asc',
					valueGetter: (params: any) => `${params.data.firstName || ''} ${params.data.lastName || ''}`,
					sortingOrder: ['asc', 'desc'],
					comparator: gridHelper.sortingComparator,
					minWidth: 180,
				},
				{ field: 'email', headerName: t('Manage.Users.Grid_EmailAddress', 'Email Address'), sortingOrder: ['asc', 'desc'], comparator: gridHelper.sortingComparator, minWidth: 200 },
				{
					headerName: t('Manage.Users.Grid_ReportsTo', 'Reports To'),
					sortable: false,
					valueGetter: (params: any) => resolveReportsToName(props.rowData, params.data.reportsToUserId),
					minWidth: 160,
				},
				{
					sortable: false,
					field: 'isActive',
					headerName: t('Manage.Users.Grid_Status', 'Status'),
					cellRenderer: (params: any) => {
						const isActive: boolean = params.value
						const emailConfirmed: boolean = params.data.emailConfirmed
						return (
							<div>
								<span className={`ml-2 ${isActive ? 'orbit-pill orbit-pill--success' : 'orbit-pill orbit-pill--danger'}`}>{isActive ? 'Active' : 'Inactive'}</span>
								<span className={`ml-2 ${emailConfirmed ? 'orbit-pill orbit-pill--success' : 'orbit-pill orbit-pill--neutral'}`}>{emailConfirmed ? 'Email Confirmed' : 'Email Not Confirmed'}</span>
							</div>
						)
					},
					minWidth: 250,
				},
				{
					field: 'id',
					sortable: false,
					headerName: t('Manage.Users.Grid_Actions', 'Actions'),
					cellClass: 'actions',
					minWidth: 200,
					flex: 1,
					cellRenderer: (params: { data: { id: string } }) => <ViewUsersActionButtons id={params.data.id} onActionClick={props.onActionClick} />,
				},
			] as any,
		[props.onActionClick, props.rowData, t]
	)

	return (
		<>
			{props.loading && loadingIndicator()}
			{!props.loading && <DataGridWithoutPagination rowData={props.rowData} columnDefs={columnDefs} />}
		</>
	)
}

export default ViewUsers
