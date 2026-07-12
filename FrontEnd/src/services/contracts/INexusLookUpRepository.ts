import type {
	CreateNexusLookUpCodeValueRequest,
	PaginationResponseOfViewNexusLookUpCodeValuesResponse,
	SearchNexusLookUpCodeValuesRequest,
	UpdateNexusLookUpCodeValueRequest,
	ViewNexusLookUpCodeValuesResponse,
	ViewNexusLookUpsResponse,
} from '@/helpers/api/WebApiClient'

export interface INexusLookUpRepository {
	getLookUpCodes(apiVersion: string): Promise<ViewNexusLookUpsResponse[]>
	getLookUpCodeValues(apiVersion: string, request: SearchNexusLookUpCodeValuesRequest): Promise<PaginationResponseOfViewNexusLookUpCodeValuesResponse>
	getLookUpCodeValueById(id: number, apiVersion: string): Promise<ViewNexusLookUpCodeValuesResponse>
	createLookUpCodeValue(apiVersion: string, request: CreateNexusLookUpCodeValueRequest): Promise<string>
	updateLookUpCodeValue(apiVersion: string, request: UpdateNexusLookUpCodeValueRequest): Promise<string>
}
