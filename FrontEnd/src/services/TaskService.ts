import { taskApiClient } from '@/helpers/api/TaskApiClient'
import type { ITaskRepository } from './contracts/ITaskRepository'

export const taskService: ITaskRepository = {
	search: (request) => taskApiClient.search(request),
	getById: (id) => taskApiClient.getById(id),
	create: (request) => taskApiClient.create(request),
	update: (id, request) => taskApiClient.update(id, request),
	markCompleted: (id, request) => taskApiClient.markCompleted(id, request),
	delete: (id) => taskApiClient.delete(id),
}
