import { lookUpClient } from '@/helpers/api/apiClients'
import type { ILookUpRepository } from './contracts/ILookUpRepository'

/**
 * Look-up service - abstraction over look-up API client.
 * Use this instead of importing lookUpClient directly for better testability.
 */
export const lookUpService: ILookUpRepository = {
	getLookUpCodes: () => lookUpClient.getLookUpCodes(),
	getLookUpCodeValues: (request) => lookUpClient.getLookUpCodeValues(request),
	getLookUpCodeValueById: (id) => lookUpClient.getLookUpCodeValueById(id),
	createLookUpCodeValue: (request) => lookUpClient.createLookUpCodeValue(request),
	updateLookUpCodeValue: (request) => lookUpClient.updateLookUpCodeValue(request),
}
