import { subscriptionClient } from '@/helpers/api/apiClients'
import type { ISubscriptionRepository } from './contracts/ISubscriptionRepository'

/**
 * Subscription service - abstraction over subscription API client.
 * Use this instead of importing subscriptionClient directly for better testability.
 */
export const subscriptionService: ISubscriptionRepository = {
	getAllSubscriptionDetails: () => subscriptionClient.getAllSubscriptionDetails(),
	getCurrentSubscriptionDetail: () => subscriptionClient.getCurrentSubscriptionDetail(),
	getPaymentStatus: (transKey) => subscriptionClient.getPaymentStatus(transKey),
	createIntent: (request) => subscriptionClient.createIntent(request),
}
