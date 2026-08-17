import type {
	CreateOfferingRequest,
	CreateOfferingResponse,
	OfferingDropDownItemResponse,
	PaginationResponseOfViewOfferingResponse,
	SearchOfferingRequest,
	UpdateOfferingRequest,
	UpdateOfferingStatusRequest,
	ViewOfferingResponse,
} from '@/types/crm/offering.types'

export interface IOfferingRepository {
	search(request: SearchOfferingRequest): Promise<PaginationResponseOfViewOfferingResponse>
	getActiveDropDown(): Promise<OfferingDropDownItemResponse[]>
	getById(id: number): Promise<ViewOfferingResponse>
	create(request: CreateOfferingRequest): Promise<CreateOfferingResponse>
	update(id: number, request: UpdateOfferingRequest): Promise<string>
	updateStatus(id: number, request: UpdateOfferingStatusRequest): Promise<string>
	delete(id: number): Promise<string>
}
