/**
 * Manual Task API client — replace with NSwag-generated TaskClient after swagger regen.
 * Do NOT add to WebApiClient.ts or apiClients.ts.
 */

import config from '@/config'
import { authenticatedFetch } from '@/helpers/api/httpClient'
import type {
	CreateTaskRequest,
	CreateTaskResponse,
	MarkTaskCompletedRequest,
	PaginationResponseOfViewTaskResponse,
	SearchTaskRequest,
	UpdateTaskRequest,
	ViewTaskResponse,
} from '@/types/crm/task.types'

const baseUrl = config.LOCAL_API_URL || config.API_URL || 'https://localhost:7027'
const apiBase = `${baseUrl}/api/v1/Task`

async function parseJson<T>(response: Response): Promise<T> {
	const text = await response.text()
	if (!text) return '' as T
	try {
		return JSON.parse(text) as T
	} catch {
		return text as T
	}
}

function buildSearchQuery(request: SearchTaskRequest): string {
	const params = new URLSearchParams()
	params.set('pageNumber', String(request.pageNumber))
	params.set('pageSize', String(request.pageSize))
	if (request.sortOrder) params.set('sortOrder', request.sortOrder)
	if (request.sortField) params.set('sortField', request.sortField)
	if (request.searchText) params.set('searchText', request.searchText)
	if (request.bucket !== undefined) params.set('bucket', String(request.bucket))
	if (request.type !== undefined) params.set('type', String(request.type))
	if (request.priority !== undefined) params.set('priority', String(request.priority))
	return params.toString()
}

export const taskApiClient = {
	search(request: SearchTaskRequest): Promise<PaginationResponseOfViewTaskResponse> {
		const url = `${apiBase}?${buildSearchQuery(request)}`
		return authenticatedFetch(url, { method: 'GET' }).then((r) => parseJson<PaginationResponseOfViewTaskResponse>(r))
	},

	getById(id: number): Promise<ViewTaskResponse> {
		return authenticatedFetch(`${apiBase}/${id}`, { method: 'GET' }).then((r) => parseJson<ViewTaskResponse>(r))
	},

	create(request: CreateTaskRequest): Promise<CreateTaskResponse> {
		return authenticatedFetch(apiBase, {
			method: 'POST',
			body: JSON.stringify(request),
		}).then((r) => parseJson<CreateTaskResponse>(r))
	},

	update(id: number, request: UpdateTaskRequest): Promise<string> {
		return authenticatedFetch(`${apiBase}/${id}`, {
			method: 'PUT',
			body: JSON.stringify({ ...request, id }),
		}).then((r) => parseJson<string>(r))
	},

	markCompleted(id: number, request: MarkTaskCompletedRequest): Promise<string> {
		return authenticatedFetch(`${apiBase}/${id}/completed`, {
			method: 'POST',
			body: JSON.stringify(request),
		}).then((r) => parseJson<string>(r))
	},

	delete(id: number): Promise<string> {
		return authenticatedFetch(`${apiBase}/${id}`, { method: 'DELETE' }).then((r) => parseJson<string>(r))
	},
}
