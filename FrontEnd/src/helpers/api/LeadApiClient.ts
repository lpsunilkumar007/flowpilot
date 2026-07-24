/**
 * Manual Lead API client — replace with NSwag-generated LeadClient after swagger regen.
 * Do NOT add to WebApiClient.ts or apiClients.ts.
 */

import config from '@/config'
import { authenticatedFetch } from '@/helpers/api/httpClient'
import type {
	AssignLeadRequest,
	CreateEntityNoteRequest,
	CreateLeadActivityRequest,
	CreateLeadRequest,
	CreateLeadResponse,
	PaginationResponseOfViewLeadListResponse,
	SearchLeadRequest,
	UpdateLeadRequest,
	UpdateLeadFollowUpDateRequest,
	UpdateLeadStatusRequest,
	ViewEntityNoteResponse,
	ViewLeadActivityResponse,
	ViewLeadDetailResponse,
	ViewLeadListResponse,
} from '@/types/crm/lead.types'
import { sanitizeLeadApiPayload } from '@/pages/orbit/manage-leads/helpers/leadApiPayload.helper'

const baseUrl = config.LOCAL_API_URL || config.API_URL || 'https://localhost:7027'
const apiBase = `${baseUrl}/api/v1/Lead`

async function parseJson<T>(response: Response): Promise<T> {
	const text = await response.text()
	if (!text) return '' as T
	try {
		return JSON.parse(text) as T
	} catch {
		return text as T
	}
}

function buildSearchQuery(request: SearchLeadRequest): string {
	const params = new URLSearchParams()
	params.set('pageNumber', String(request.pageNumber))
	params.set('pageSize', String(request.pageSize))
	if (request.sortOrder) params.set('sortOrder', request.sortOrder)
	if (request.sortField) params.set('sortField', request.sortField)
	if (request.filterType !== undefined) params.set('filterType', String(request.filterType))
	if (request.searchText) params.set('searchText', request.searchText)
	if (request.assignedToUserId) params.set('assignedToUserId', request.assignedToUserId)
	if (request.fromDate) params.set('fromDate', request.fromDate)
	if (request.toDate) params.set('toDate', request.toDate)
	return params.toString()
}

export const leadApiClient = {
	search(request: SearchLeadRequest): Promise<PaginationResponseOfViewLeadListResponse> {
		const url = `${apiBase}?${buildSearchQuery(request)}`
		return authenticatedFetch(url, { method: 'GET' }).then((r) => parseJson<PaginationResponseOfViewLeadListResponse>(r))
	},

	getById(id: number): Promise<ViewLeadDetailResponse> {
		return authenticatedFetch(`${apiBase}/${id}`, { method: 'GET' }).then((r) => parseJson<ViewLeadDetailResponse>(r))
	},

	create(request: CreateLeadRequest): Promise<CreateLeadResponse> {
		return authenticatedFetch(apiBase, {
			method: 'POST',
			body: JSON.stringify(sanitizeLeadApiPayload(request)),
		}).then((r) => parseJson<CreateLeadResponse>(r))
	},

	update(id: number, request: UpdateLeadRequest): Promise<string> {
		return authenticatedFetch(`${apiBase}/${id}`, {
			method: 'PUT',
			body: JSON.stringify(sanitizeLeadApiPayload({ ...request, id })),
		}).then((r) => parseJson<string>(r))
	},

	updateStatus(id: number, request: UpdateLeadStatusRequest): Promise<string> {
		return authenticatedFetch(`${apiBase}/${id}/status`, {
			method: 'POST',
			body: JSON.stringify(request),
		}).then((r) => parseJson<string>(r))
	},

	assign(id: number, request: AssignLeadRequest): Promise<string> {
		return authenticatedFetch(`${apiBase}/${id}/assign`, {
			method: 'POST',
			body: JSON.stringify(request),
		}).then((r) => parseJson<string>(r))
	},

	updateFollowUpDate(id: number, request: UpdateLeadFollowUpDateRequest): Promise<string> {
		return authenticatedFetch(`${apiBase}/${id}/followup-date`, {
			method: 'POST',
			body: JSON.stringify(sanitizeLeadApiPayload(request)),
		}).then((r) => parseJson<string>(r))
	},

	getActivities(id: number): Promise<ViewLeadActivityResponse[]> {
		return authenticatedFetch(`${apiBase}/${id}/activities`, { method: 'GET' }).then((r) => parseJson<ViewLeadActivityResponse[]>(r))
	},

	createActivity(id: number, request: CreateLeadActivityRequest): Promise<ViewLeadActivityResponse> {
		return authenticatedFetch(`${apiBase}/${id}/activities`, {
			method: 'POST',
			body: JSON.stringify(sanitizeLeadApiPayload(request)),
		}).then((r) => parseJson<ViewLeadActivityResponse>(r))
	},

	getTodayFollowUps(): Promise<ViewLeadListResponse[]> {
		return authenticatedFetch(`${apiBase}/followups/today`, { method: 'GET' }).then((r) => parseJson<ViewLeadListResponse[]>(r))
	},

	getOverdueFollowUps(): Promise<ViewLeadListResponse[]> {
		return authenticatedFetch(`${apiBase}/followups/overdue`, { method: 'GET' }).then((r) => parseJson<ViewLeadListResponse[]>(r))
	},

	getNotes(id: number): Promise<ViewEntityNoteResponse[]> {
		return authenticatedFetch(`${apiBase}/${id}/notes`, { method: 'GET' }).then((r) => parseJson<ViewEntityNoteResponse[]>(r))
	},

	createNote(id: number, request: CreateEntityNoteRequest): Promise<ViewEntityNoteResponse> {
		return authenticatedFetch(`${apiBase}/${id}/notes`, {
			method: 'POST',
			body: JSON.stringify(request),
		}).then((r) => parseJson<ViewEntityNoteResponse>(r))
	},
}
