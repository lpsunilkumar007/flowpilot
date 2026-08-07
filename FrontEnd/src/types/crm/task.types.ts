export enum TaskBucket {
	Today = 0,
	Tomorrow = 1,
	Overdue = 2,
	Future = 3,
}

export enum TaskType {
	Task = 0,
	Call = 1,
	Email = 2,
	Meeting = 3,
}

export enum TaskPriority {
	Low = 0,
	Medium = 1,
	High = 2,
}

export interface ViewTaskResponse {
	id: number
	uuid: string
	title: string
	when: string
	bucket?: TaskBucket | string | null
	type?: TaskType | string | null
	priority?: TaskPriority | string | null
	isCompleted: boolean
	createdOn: string
}

export interface CreateTaskRequest {
	title: string
	when: string
	bucket?: TaskBucket | null
	type?: TaskType | null
	priority?: TaskPriority | null
}

export interface UpdateTaskRequest {
	id: number
	title: string
	when: string
	bucket?: TaskBucket | null
	type?: TaskType | null
	priority?: TaskPriority | null
}

export interface MarkTaskCompletedRequest {
	isCompleted: boolean
}

export interface CreateTaskResponse {
	id: number
	uuid: string
	message: string
}

export interface SearchTaskRequest {
	pageNumber: number
	pageSize: number
	sortOrder?: string
	sortField?: string
	searchText?: string
	bucket?: TaskBucket
	type?: TaskType
	priority?: TaskPriority
	createdByUserId?: string
}

export interface PaginationResponseOfViewTaskResponse {
	data: ViewTaskResponse[]
	currentPage: number
	totalPages: number
	totalCount: number
	pageSize: number
	hasPreviousPage: boolean
	hasNextPage: boolean
}
