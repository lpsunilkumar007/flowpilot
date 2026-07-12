import type {
	DownloadFileResponse,
	GetTenantSubscriptionResponse,
	PaginationResponseOfViewTenantResponse,
	SearchTenantRequest,
	UpdateTenantRequest,
	ViewTenantResponse,
	ViewUserDetailsResponse,
} from '@/helpers/api/WebApiClient'

export interface IMultiTenantRepository {
	getTenant(request: SearchTenantRequest): Promise<PaginationResponseOfViewTenantResponse>
	getTenantById(id: number): Promise<ViewTenantResponse>
	getTenantUsers(id: number): Promise<ViewUserDetailsResponse[]>
	getTenantSubscription(id: number | null): Promise<GetTenantSubscriptionResponse[]>
	updateTenantDetails(request: UpdateTenantRequest): Promise<string>
	downloadInvoice(id: number): Promise<DownloadFileResponse>
}
