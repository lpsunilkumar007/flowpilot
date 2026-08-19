import config from '@/config'
import { authenticatedFetch } from '@/helpers/api/httpClient'
import type {
	CreateOfferingRequest,
	CreateOfferingResponse,
	PaginationResponseOfViewOfferingResponse,
	SearchOfferingRequest,
	UpdateOfferingRequest,
	UpdateOfferingStatusRequest,
	ViewOfferingResponse,
} from '@/types/crm/offering.types'
import type { IOfferingRepository } from './contracts/IOfferingRepository'

const buildQuery = (params: Record<string, unknown>) => {
	const searchParams = new URLSearchParams()

	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null && value !== '') {
			searchParams.set(key, String(value))
		}
	})

	const query = searchParams.toString()
	return query ? `?${query}` : ''
}

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
	const response = await authenticatedFetch(`${config.API_URL}${url}`, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			...(init?.headers ?? {}),
		},
	})

	const text = await response.text()
	return (text ? JSON.parse(text) : undefined) as T
}

export const offeringService: IOfferingRepository = {
	search: (request: SearchOfferingRequest) =>
		requestJson<PaginationResponseOfViewOfferingResponse>(
			`/api/v1/offering${buildQuery({
				SearchText: request.searchText,
				Type: request.type,
				Status: request.status,
				OwnerUserId: request.ownerUserId,
				PageNumber: request.pageNumber,
				PageSize: request.pageSize,
				sortOrder: request.sortOrder,
				sortField: request.sortField,
			})}`
		),

	getById: (id: number) => requestJson<ViewOfferingResponse>(`/api/v1/offering/${id}`),

	create: (request: CreateOfferingRequest) =>
		requestJson<CreateOfferingResponse>('/api/v1/offering', {
			method: 'POST',
			body: JSON.stringify(request),
		}),

	update: (id: number, request: UpdateOfferingRequest) =>
		requestJson<string>(`/api/v1/offering/${id}`, {
			method: 'PUT',
			body: JSON.stringify({ ...request, id }),
		}),

	updateStatus: (id: number, request: UpdateOfferingStatusRequest) =>
		requestJson<string>(`/api/v1/offering/${id}/status`, {
			method: 'POST',
			body: JSON.stringify(request),
		}),

	delete: (id: number) =>
		requestJson<string>(`/api/v1/offering/${id}`, {
			method: 'DELETE',
		}),
}
