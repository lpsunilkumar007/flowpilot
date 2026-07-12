import { multiTenantClient } from '@/helpers/api/apiClients'
import type { IMultiTenantRepository } from './contracts/IMultiTenantRepository'

/**
 * Multi-tenant service - abstraction over multi-tenant API client.
 * Use this instead of importing multiTenantClient directly for better testability.
 */
export const multiTenantService: IMultiTenantRepository = {
	getTenant: (request) => multiTenantClient.getTenant(request),
	getTenantById: (id) => multiTenantClient.getTenantById(id),
	getTenantUsers: (id) => multiTenantClient.getTenantUsers(id),
	getTenantSubscription: (id) => multiTenantClient.getTenantSubscription(id),
	updateTenantDetails: (request) => multiTenantClient.updateTenantDetails(request),
	downloadInvoice: (id) => multiTenantClient.downloadInvoice(id),
}
