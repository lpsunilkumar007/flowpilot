import type { ViewTaskResponse } from '@/types/crm/task.types'
import { useTranslation } from 'react-i18next'
import {
	formatPriorityLabel,
	formatTaskWhenLabel,
	getPriorityPillClass,
	getTaskTypeIcon,
	getTaskTypeIconTone,
	resolveTaskBucket,
	taskCardClass,
} from '../helpers/taskDisplay.helper'

interface TaskListCardProps {
	task: ViewTaskResponse
	disabled?: boolean
	onToggleCompleted: () => void
}

const TaskListCard: React.FC<TaskListCardProps> = ({ task, disabled = false, onToggleCompleted }) => {
	const { t } = useTranslation()
	const bucket = resolveTaskBucket(task)
	const isCompleted = Boolean(task.isCompleted)

	return (
		<article className={`${taskCardClass} flex items-center gap-3 px-4 py-3`}>
			<input
				type="checkbox"
				checked={isCompleted}
				disabled={disabled}
				onChange={onToggleCompleted}
				className="form-checkbox h-4 w-4 shrink-0 rounded border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
				aria-label={`Mark task ${task.title} complete`}
			/>

			<span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${getTaskTypeIconTone(task.type)}`}>
				<i className={`${getTaskTypeIcon(task.type)} text-lg`} />
			</span>

			<div className="min-w-0 flex-1">
				<p className={`truncate font-medium text-gray-900 dark:text-gray-100 ${isCompleted ? 'line-through opacity-60' : ''}`}>{task.title}</p>
				<p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{formatTaskWhenLabel(task.when, bucket)}</p>
			</div>

			{isCompleted && (
				<span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
					{t('Manage.Tasks.Completed_Status', 'Completed')}
				</span>
			)}

			<span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ${getPriorityPillClass(task.priority)}`}>
				{formatPriorityLabel(task.priority)}
			</span>
		</article>
	)
}

export default TaskListCard
