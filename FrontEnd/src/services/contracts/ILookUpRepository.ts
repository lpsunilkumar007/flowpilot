import type {
	CreateLookUpCodeValueRequest,
	PaginationResponseOfViewLookUpCodeValuesResponse,
	SearchLookUpCodeValuesRequest,
	UpdateLookUpCodeValueRequest,
	ViewLookUpCodeValuesResponse,
	ViewLookUpsResponse,
} from '@/helpers/api/WebApiClient'

export interface ILookUpRepository {
	getLookUpCodes(): Promise<ViewLookUpsResponse[]>
	getLookUpCodeValues(request: SearchLookUpCodeValuesRequest): Promise<PaginationResponseOfViewLookUpCodeValuesResponse>
	getLookUpCodeValueById(id: number): Promise<ViewLookUpCodeValuesResponse>
	createLookUpCodeValue(request: CreateLookUpCodeValueRequest): Promise<string>
	updateLookUpCodeValue(request: UpdateLookUpCodeValueRequest): Promise<string>
}
