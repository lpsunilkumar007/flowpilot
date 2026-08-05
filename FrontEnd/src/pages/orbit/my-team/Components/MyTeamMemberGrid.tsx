import DataGridWithoutPagination from '@/components/DataGrid/DataGridWithoutPagination'
import { MenuLinks } from '@/constants/menu'
import { gridHelper } from '@/helpers/grid.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import type { MyTeamMemberResponse, MyTeamRelation } from '@/types/crm/myTeam.types'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import MyTeamMemberActions from './MyTeamMemberActions'

interface MyTeamMemberGridProps {
	members: MyTeamMemberResponse[]
	relation: MyTeamRelation
	loading: boolean
	filterMemberIds: string[] | null
}

const MyTeamMemberGrid: React.FC<MyTeamMemberGridProps> = ({ members, relation, loading, filterMemberIds }) => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const teamMode = relation === 'Direct' ? 'direct' : 'indirect'

	const filtered = useMemo(() => {
		if (!filterMemberIds) return members
		const idSet = new Set(filterMemberIds)
		return members.filter((m) => idSet.has(m.userId))
	}, [members, filterMemberIds])

	const onActionClick = (userId: string, action: string) => {
		if (action === 'ViewLeads') {
			navigate(`${MenuLinks.ManageLeads}?assignedToUserId=${encodeURIComponent(userId)}&teamMode=${teamMode}`)
			return
		}
		if (action === 'ViewTasks') {
			navigate(`${MenuLinks.ManageTasks}?createdByUserId=${encodeURIComponent(userId)}&teamMode=${teamMode}`)
		}
	}

	const columnDefs = useMemo(
		() =>
			[
				{
					headerName: t('Manage.MyTeam.Grid_Name', 'Name'),
					sort: 'asc',
					valueGetter: (params: { data: MyTeamMemberResponse }) => `${params.data.firstName || ''} ${params.data.lastName || ''}`.trim(),
					sortingOrder: ['asc', 'desc'],
					comparator: gridHelper.sortingComparator,
					minWidth: 180,
				},
				{
					field: 'email',
					headerName: t('Manage.MyTeam.Grid_Email', 'Email'),
					sortingOrder: ['asc', 'desc'],
					comparator: gridHelper.sortingComparator,
					minWidth: 200,
				},
				{
					sortable: false,
					field: 'isActive',
					headerName: t('Manage.MyTeam.Grid_Status', 'Status'),
					cellRenderer: (params: { value: boolean }) => (
						<span className={`ml-2 ${params.value ? 'orbit-pill orbit-pill--success' : 'orbit-pill orbit-pill--danger'}`}>
							{params.value ? t('Common.Active', 'Active') : t('Common.Inactive', 'Inactive')}
						</span>
					),
					minWidth: 120,
				},
				{
					field: 'userId',
					sortable: false,
					headerName: t('Manage.MyTeam.Grid_Actions', 'Actions'),
					cellClass: 'actions',
					minWidth: 220,
					flex: 1,
					cellRenderer: (params: { data: MyTeamMemberResponse }) => (
						<MyTeamMemberActions userId={params.data.userId} onActionClick={onActionClick} />
					),
				},
			] as any,
		[t, teamMode]
	)

	if (loading) return <AnimationSkeleton />

	if (filtered.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-gray-200 p-10 text-center dark:border-gray-700">
				<i className="ri-team-line text-4xl text-gray-300" />
				<p className="mt-3 text-lg font-medium text-gray-700 dark:text-gray-200">
					{t('Manage.MyTeam.Empty_Title', 'No team members found')}
				</p>
				<p className="mt-1 text-sm text-gray-500">
					{filterMemberIds
						? t('Manage.MyTeam.Empty_Filter', 'No members match the selected chart slice. Click the slice again to clear.')
						: t('Manage.MyTeam.Empty_Subtitle', 'There are no people in this reporting group.')}
				</p>
			</div>
		)
	}

	return <DataGridWithoutPagination rowData={filtered} columnDefs={columnDefs} />
}

export default MyTeamMemberGrid
