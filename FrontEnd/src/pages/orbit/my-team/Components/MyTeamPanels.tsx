import { TabsWrapper } from '@/components'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { myTeamService } from '@/services/MyTeamService'
import { MyTeamRelation, type MyTeamMemberResponse, type MyTeamStatsResponse, type MyTeamStatsSliceResponse } from '@/types/crm/myTeam.types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import MyTeamMemberGrid from './MyTeamMemberGrid'
import MyTeamPieChart, { type MyTeamChartKind } from './MyTeamPieChart'

interface SliceFilter {
	chartKind: MyTeamChartKind
	key: string
	memberIds: string[]
}

const emptyStats = (): MyTeamStatsResponse => ({
	leadStatus: [],
	taskProgress: [],
	leadInterest: [],
})

interface TeamRelationPanelProps {
	relation: MyTeamRelation
}

const TeamRelationPanel: React.FC<TeamRelationPanelProps> = ({ relation }) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(true)
	const [members, setMembers] = useState<MyTeamMemberResponse[]>([])
	const [stats, setStats] = useState<MyTeamStatsResponse>(emptyStats())
	const [sliceFilter, setSliceFilter] = useState<SliceFilter | null>(null)

	const load = useCallback(async () => {
		await runWithToast(
			async () => {
				const [allMembers, relationStats] = await Promise.all([myTeamService.getMembers(), myTeamService.getStats(relation)])
				setMembers(allMembers ?? [])
				setStats(relationStats ?? emptyStats())
				return relationStats
			},
			{ setLoading }
		)
	}, [relation])

	useEffect(() => {
		load()
	}, [load])

	const relationMembers = useMemo(
		() => members.filter((m) => String(m.relation) === relation),
		[members, relation]
	)

	const onSliceClick = (chartKind: MyTeamChartKind, slice: MyTeamStatsSliceResponse) => {
		setSliceFilter((prev) => {
			if (prev?.chartKind === chartKind && prev.key === slice.key) return null
			return { chartKind, key: slice.key, memberIds: slice.memberIds ?? [] }
		})
	}

	if (loading && members.length === 0) return <AnimationSkeleton />

	return (
		<div>
			<div className="mb-6 grid gap-4 lg:grid-cols-3">
				<MyTeamPieChart
					title={t('Manage.MyTeam.Chart_LeadStatus', 'Lead status')}
					slices={stats.leadStatus ?? []}
					chartKind="leadStatus"
					selectedKey={sliceFilter?.key ?? null}
					selectedChart={sliceFilter?.chartKind ?? null}
					onSliceClick={onSliceClick}
				/>
				<MyTeamPieChart
					title={t('Manage.MyTeam.Chart_TaskProgress', 'Task progress')}
					slices={stats.taskProgress ?? []}
					chartKind="taskProgress"
					selectedKey={sliceFilter?.key ?? null}
					selectedChart={sliceFilter?.chartKind ?? null}
					onSliceClick={onSliceClick}
				/>
				<MyTeamPieChart
					title={t('Manage.MyTeam.Chart_LeadInterest', 'Lead interest')}
					slices={stats.leadInterest ?? []}
					chartKind="leadInterest"
					selectedKey={sliceFilter?.key ?? null}
					selectedChart={sliceFilter?.chartKind ?? null}
					onSliceClick={onSliceClick}
				/>
			</div>
			{sliceFilter && (
				<div className="mb-4 flex items-center justify-between gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
					<span>
						{t('Manage.MyTeam.Filter_Active', 'Filtered by chart selection')} ({sliceFilter.memberIds.length})
					</span>
					<button type="button" className="btn btn-sm btn-secondary" onClick={() => setSliceFilter(null)}>
						{t('Common.Clear', 'Clear')}
					</button>
				</div>
			)}
			<MyTeamMemberGrid
				members={relationMembers}
				relation={relation}
				loading={loading}
				filterMemberIds={sliceFilter?.memberIds ?? null}
			/>
		</div>
	)
}

const MyTeamPanels: React.FC = () => {
	const { t } = useTranslation()

	return (
		<TabsWrapper
			variant="pill"
			tabs={[
				{
					key: 'direct',
					title: t('Manage.MyTeam.Tab_Direct', 'Direct'),
					content: <TeamRelationPanel relation={MyTeamRelation.Direct} />,
				},
				{
					key: 'indirect',
					title: t('Manage.MyTeam.Tab_Indirect', 'Indirect'),
					content: <TeamRelationPanel relation={MyTeamRelation.Indirect} />,
				},
			]}
		/>
	)
}

export default MyTeamPanels
