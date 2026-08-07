import type {
	CreateTaskRequest,
	CreateTaskResponse,
	MarkTaskCompletedRequest,
	PaginationResponseOfViewTaskResponse,
	SearchTaskRequest,
	UpdateTaskRequest,
	ViewTaskResponse,
} from '@/types/crm/task.types'

export interface ITaskRepository {
	search(request: SearchTaskRequest): Promise<PaginationResponseOfViewTaskResponse>
	getById(id: number): Promise<ViewTaskResponse>
	create(request: CreateTaskRequest): Promise<CreateTaskResponse>
	update(id: number, request: UpdateTaskRequest): Promise<string>
	markCompleted(id: number, request: MarkTaskCompletedRequest): Promise<string>
	delete(id: number): Promise<string>
}
