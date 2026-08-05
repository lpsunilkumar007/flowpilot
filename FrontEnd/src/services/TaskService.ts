import { taskClient } from '@/helpers/api/apiClients'
import type {
	CreateTaskRequest as ApiCreateTaskRequest,
	MarkTaskCompletedRequest as ApiMarkTaskCompletedRequest,
	TaskBucket as ApiTaskBucket,
	TaskPriority as ApiTaskPriority,
	TaskType as ApiTaskType,
	UpdateTaskRequest as ApiUpdateTaskRequest,
} from '@/helpers/api/WebApiClient'
import type { ITaskRepository } from './contracts/ITaskRepository'

/** NSwag DTOs use Moment/string enums; UI keeps plain CRM types. */
const asUi = <T>(value: unknown) => value as T

export const taskService: ITaskRepository = {
	search: (request) =>
		asUi(
			taskClient.search(
				request.searchText,
				request.bucket as unknown as ApiTaskBucket | null | undefined,
				request.type as unknown as ApiTaskType | null | undefined,
				request.priority as unknown as ApiTaskPriority | null | undefined,
				request.createdByUserId,
				request.pageNumber,
				request.pageSize,
				request.sortOrder,
				request.sortField
			)
		),

	getById: (id) => asUi(taskClient.getById(id)),

	create: (request) => asUi(taskClient.create(request as unknown as ApiCreateTaskRequest)),

	update: (id, request) =>
		taskClient.update(id, { ...request, id } as unknown as ApiUpdateTaskRequest),

	markCompleted: (id, request) =>
		taskClient.markCompleted(id, request as unknown as ApiMarkTaskCompletedRequest),

	delete: (id) => taskClient.delete(id),
}
