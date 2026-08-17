export enum OfferingType {
	Product = 0,
	Project = 1,
}

export enum OfferingStatus {
	Active = 0,
	Inactive = 1,
}

export interface SearchOfferingRequest {
	pageNumber: number
	pageSize: number
	sortOrder?: string
	sortField?: string
	searchText?: string
	type?: OfferingType
	status?: OfferingStatus
	ownerUserId?: string
}

export interface CreateOfferingRequest {
	name: string
	type: OfferingType | string
	status: OfferingStatus | string
	description?: string
	ownerUserId: string
	expectedValueFrom?: number
	expectedValueTo?: number
}

export interface UpdateOfferingRequest extends CreateOfferingRequest {
	id: number
}

export interface UpdateOfferingStatusRequest {
	status: OfferingStatus
}

export interface CreateOfferingResponse {
	id: number
	message: string
}

export interface ViewOfferingResponse {
	id: number
	uniqueId: string
	name: string
	type: OfferingType | string
	status: OfferingStatus | string
	description?: string
	ownerUserId: string
	expectedValueFrom?: number
	expectedValueTo?: number
	leadCount: number
	createdOn: string
}

export interface OfferingDropDownItemResponse {
	value: number
	uniqueId: string
	text: string
}

export interface PaginationResponseOfViewOfferingResponse {
	data: ViewOfferingResponse[]
	currentPage: number
	totalPages: number
	totalCount: number
	pageSize: number
	hasPreviousPage: boolean
	hasNextPage: boolean
}
