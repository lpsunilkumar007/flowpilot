import moment from 'moment'
import { TaskBucket, TaskPriority, TaskType, type ViewTaskResponse } from '@/types/crm/task.types'

export const taskCardClass = 'rounded-xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800'

/** Resolve API enum values that may arrive as number or string name. */
const enumName = (enumObj: Record<string | number, string | number>, value: string | number | null | undefined, fallback: string): string => {
	if (value == null || value === '') return fallback
	if (typeof value === 'string') {
		if (value in enumObj && typeof enumObj[value] === 'number') return value
		const asNum = Number(value)
		if (!Number.isNaN(asNum) && typeof enumObj[asNum] === 'string') return enumObj[asNum] as string
		return value
	}
	const name = enumObj[value]
	return typeof name === 'string' ? name : fallback
}

export const getTaskTypeIcon = (type?: TaskType | string | null): string => {
	const key = enumName(TaskType as unknown as Record<string | number, string | number>, type, 'Task')
	const map: Record<string, string> = {
		Task: 'ri-checkbox-circle-line',
		Call: 'ri-phone-line',
		Email: 'ri-mail-line',
		Meeting: 'ri-group-line',
	}
	return map[key] ?? 'ri-checkbox-circle-line'
}

export const getTaskTypeIconTone = (type?: TaskType | string | null): string => {
	const key = enumName(TaskType as unknown as Record<string | number, string | number>, type, 'Task')
	const map: Record<string, string> = {
		Task: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300',
		Call: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
		Email: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300',
		Meeting: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
	}
	return map[key] ?? map.Task
}

export const getPriorityPillClass = (priority?: TaskPriority | string | null): string => {
	const key = enumName(TaskPriority as unknown as Record<string | number, string | number>, priority, 'Medium')
	const map: Record<string, string> = {
		High: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
		Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
		Low: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
	}
	return map[key] ?? map.Medium
}

export const formatPriorityLabel = (priority?: TaskPriority | string | null): string => {
	return enumName(TaskPriority as unknown as Record<string | number, string | number>, priority, 'Medium').toUpperCase()
}

export const formatTaskTypeLabel = (type?: TaskType | string | null): string => {
	return enumName(TaskType as unknown as Record<string | number, string | number>, type, 'Task')
}

export const toTaskType = (value?: TaskType | string | null): TaskType | null => {
	if (value == null || value === '') return null
	if (typeof value === 'number') return value
	const name = enumName(TaskType as unknown as Record<string | number, string | number>, value, '')
	return name && name in TaskType ? (TaskType[name as keyof typeof TaskType] as TaskType) : null
}

export const toTaskPriority = (value?: TaskPriority | string | null): TaskPriority | null => {
	if (value == null || value === '') return null
	if (typeof value === 'number') return value
	const name = enumName(TaskPriority as unknown as Record<string | number, string | number>, value, '')
	return name && name in TaskPriority ? (TaskPriority[name as keyof typeof TaskPriority] as TaskPriority) : null
}

export const isTaskOverdue = (when: string, now = moment()): boolean => moment(when).isBefore(now, 'day')

export const getTaskCalendarColor = (when: string): string => (isTaskOverdue(when) ? '#EF4444' : '#2563EB')

/** Derive TaskBucket from a When datetime (Today / Tomorrow / Overdue / Future). */
export const computeBucketFromWhen = (when: string | moment.Moment, now = moment()): TaskBucket => {
	const whenMoment = moment(when)
	if (!whenMoment.isValid()) return TaskBucket.Today

	const todayStart = now.clone().startOf('day')
	if (whenMoment.isBefore(todayStart, 'day')) return TaskBucket.Overdue
	if (whenMoment.isSame(todayStart, 'day')) return TaskBucket.Today
	if (whenMoment.isSame(todayStart.clone().add(1, 'day'), 'day')) return TaskBucket.Tomorrow
	return TaskBucket.Future
}

export const resolveTaskBucket = (task: ViewTaskResponse, now = moment()): TaskBucket | null => {
	const bucketName = enumName(TaskBucket as unknown as Record<string | number, string | number>, task.bucket, '')
	if (bucketName === 'Today') return TaskBucket.Today
	if (bucketName === 'Tomorrow') return TaskBucket.Tomorrow
	if (bucketName === 'Overdue') return TaskBucket.Overdue
	if (bucketName === 'Future') return TaskBucket.Future

	return computeBucketFromWhen(task.when, now)
}

export const formatTaskWhenLabel = (when: string, bucket?: TaskBucket | null): string => {
	const m = moment(when)
	if (!m.isValid()) return '—'

	if (bucket === TaskBucket.Today) return m.format('h:mm A')
	if (bucket === TaskBucket.Tomorrow) return `Tomorrow · ${m.format('h:mm A')}`
	if (bucket === TaskBucket.Overdue) return m.fromNow()
	if (bucket === TaskBucket.Future) return m.format('DD-MMM-YYYY h:mm A')
	return m.format('DD-MMM-YYYY h:mm A')
}

/** Combine bucket + time (HH:mm) into an ISO datetime for the API. */
export const buildWhenFromBucketAndTime = (bucket: TaskBucket, time: string, now = moment()): moment.Moment => {
	const [hours, minutes] = time.split(':').map((v) => Number(v))
	const base =
		bucket === TaskBucket.Tomorrow
			? now.clone().add(1, 'day').startOf('day')
			: bucket === TaskBucket.Overdue
				? now.clone().subtract(1, 'day').startOf('day')
				: bucket === TaskBucket.Future
					? now.clone().add(2, 'day').startOf('day')
					: now.clone().startOf('day')

	return base.hour(Number.isFinite(hours) ? hours : 0).minute(Number.isFinite(minutes) ? minutes : 0).second(0).millisecond(0)
}

export const groupTasksByBucket = (tasks: ViewTaskResponse[]) => {
	const today: ViewTaskResponse[] = []
	const tomorrow: ViewTaskResponse[] = []
	const overdue: ViewTaskResponse[] = []
	const future: ViewTaskResponse[] = []

	for (const task of tasks) {
		const bucket = resolveTaskBucket(task)
		if (bucket === TaskBucket.Today) today.push(task)
		else if (bucket === TaskBucket.Tomorrow) tomorrow.push(task)
		else if (bucket === TaskBucket.Overdue) overdue.push(task)
		else if (bucket === TaskBucket.Future) future.push(task)
	}

	const byWhenAsc = (a: ViewTaskResponse, b: ViewTaskResponse) => moment(a.when).valueOf() - moment(b.when).valueOf()
	const byWhenDesc = (a: ViewTaskResponse, b: ViewTaskResponse) => moment(b.when).valueOf() - moment(a.when).valueOf()

	today.sort(byWhenAsc)
	tomorrow.sort(byWhenAsc)
	overdue.sort(byWhenDesc)
	future.sort(byWhenAsc)

	return { today, tomorrow, overdue, future }
}
