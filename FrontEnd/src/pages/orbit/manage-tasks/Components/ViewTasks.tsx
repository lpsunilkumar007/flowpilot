import { PagingVariables } from '@/constants/paging'
import { PermissionTypes } from '@/constants/permissions'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { messageHelper } from '@/helpers/message.helper'
import { usePermission } from '@/hooks/usePermission'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { taskService } from '@/services/TaskService'
import type { ViewTaskResponse } from '@/types/crm/task.types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { groupTasksByBucket } from '../helpers/taskDisplay.helper'
import TaskListCard from './TaskListCard'

interface ViewTasksProps {
	reloadTasks: boolean
}

interface TaskSectionProps {
	title: string
	tasks: ViewTaskResponse[]
	updatingTaskId: number | null
	onToggleCompleted: (task: ViewTaskResponse) => void
	canUpdate: boolean
	emptyLabel: string
}

const TaskSection: React.FC<TaskSectionProps> = ({ title, tasks, updatingTaskId, onToggleCompleted, canUpdate, emptyLabel }) => (
	<section className="space-y-3">
		<div className="flex items-center gap-2">
			<h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200">{title}</h3>
			<span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">{tasks.length}</span>
		</div>
		{tasks.length === 0 ? (
			<p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400 dark:border-gray-700">{emptyLabel}</p>
		) : (
			<div className="space-y-2">
				{tasks.map((task) => (
					<TaskListCard
						key={task.id}
						task={task}
						disabled={!canUpdate || updatingTaskId === task.id}
						onToggleCompleted={() => onToggleCompleted(task)}
					/>
				))}
			</div>
		)}
	</section>
)

const ViewTasks: React.FC<ViewTasksProps> = ({ reloadTasks }) => {
	const { t } = useTranslation()
	const { userHasPermission } = usePermission()
	const [searchParams] = useSearchParams()
	const teamMode = searchParams.get('teamMode')
	const createdByUserId = searchParams.get('createdByUserId') || undefined
	const isTeamContext = Boolean(teamMode && createdByUserId)
	const isIndirectTeam = teamMode === 'indirect'
	const canUpdate = userHasPermission(PermissionTypes.Permissions_ManageTasks_Update) && !isIndirectTeam
	const [loading, setLoading] = useState(true)
	const [tasks, setTasks] = useState<ViewTaskResponse[]>([])
	const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null)

	const fetchTasks = useCallback(async () => {
		await runWithToast(
			async () => {
				const res = await taskService.search({
					pageNumber: 0,
					pageSize: PagingVariables.DefaultPageSize,
					sortField: 'When',
					sortOrder: 'asc',
					...(createdByUserId ? { createdByUserId } : {}),
				})
				setTasks(res?.data ?? [])
				return res
			},
			{ setLoading }
		)
	}, [createdByUserId])

	useEffect(() => {
		fetchTasks()
	}, [reloadTasks, fetchTasks])

	const grouped = useMemo(() => groupTasksByBucket(tasks), [tasks])

	const onToggleCompleted = async (task: ViewTaskResponse) => {
		if (!canUpdate) return

		const nextCompleted = !task.isCompleted
		setUpdatingTaskId(task.id)

		await runWithToast(() => taskService.markCompleted(task.id, { isCompleted: nextCompleted }), {
			onSuccess: () => {
				setTasks((prev) => prev.map((item) => (item.id === task.id ? { ...item, isCompleted: nextCompleted } : item)))
				if (nextCompleted) {
					messageHelper.showSuccess(t('Manage.Tasks.Completed_Message', 'Task marked as completed'))
				}
			},
		})

		setUpdatingTaskId(null)
	}

	if (loading) return <AnimationSkeleton />

	const sectionProps = {
		updatingTaskId,
		onToggleCompleted,
		canUpdate,
	}

	return (
		<div className="space-y-8">
			{isTeamContext && (
				<div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
					{isIndirectTeam
						? t('Manage.Tasks.TeamMode_Indirect', 'Viewing team member tasks (read-only).')
						: t('Manage.Tasks.TeamMode_Direct', 'Viewing team member tasks.')}
				</div>
			)}
			<TaskSection title={t('Manage.Tasks.Section_Today', 'Today')} tasks={grouped.today} emptyLabel={t('Manage.Tasks.Empty_Today', 'No tasks for today')} {...sectionProps} />
			<TaskSection title={t('Manage.Tasks.Section_Tomorrow', 'Tomorrow')} tasks={grouped.tomorrow} emptyLabel={t('Manage.Tasks.Empty_Tomorrow', 'No tasks for tomorrow')} {...sectionProps} />
			<TaskSection title={t('Manage.Tasks.Section_Overdue', 'Overdue')} tasks={grouped.overdue} emptyLabel={t('Manage.Tasks.Empty_Overdue', 'No overdue tasks')} {...sectionProps} />
			<TaskSection title={t('Manage.Tasks.Section_Future', 'Future')} tasks={grouped.future} emptyLabel={t('Manage.Tasks.Empty_Future', 'No future tasks')} {...sectionProps} />
		</div>
	)
}

export default ViewTasks
