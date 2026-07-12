import type {
	CreateIntentRequest,
	CreateIntentResponse,
	GetPaymentStatusResponse,
	GetSubscriptionPlanDetailsResponse,
	TenantCurrentSubscriptionDetailResponse,
} from '@/helpers/api/WebApiClient'

export interface ISubscriptionRepository {
	getAllSubscriptionDetails(): Promise<GetSubscriptionPlanDetailsResponse[]>
	getCurrentSubscriptionDetail(): Promise<TenantCurrentSubscriptionDetailResponse>
	getPaymentStatus(transKey: string): Promise<GetPaymentStatusResponse>
	createIntent(request: CreateIntentRequest): Promise<CreateIntentResponse>
}
