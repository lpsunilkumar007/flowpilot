import { nexusLookUpClient } from '@/helpers/api/apiClients'
import type { INexusLookUpRepository } from './contracts/INexusLookUpRepository'

const DEFAULT_API_VERSION = '1'

/**
 * Nexus look-up service - abstraction over nexus look-up API client.
 * Use this instead of importing nexusLookUpClient directly for better testability.
 */
export const nexusLookUpService: INexusLookUpRepository = {
	getLookUpCodes: (apiVersion) => nexusLookUpClient.getLookUpCodes(apiVersion || DEFAULT_API_VERSION),
	getLookUpCodeValues: (apiVersion, request) => nexusLookUpClient.getLookUpCodeValues(apiVersion || DEFAULT_API_VERSION, request),
	getLookUpCodeValueById: (id, apiVersion) => nexusLookUpClient.getLookUpCodeValueById(id, apiVersion || DEFAULT_API_VERSION),
	createLookUpCodeValue: (apiVersion, request) => nexusLookUpClient.createLookUpCodeValue(apiVersion || DEFAULT_API_VERSION, request),
	updateLookUpCodeValue: (apiVersion, request) => nexusLookUpClient.updateLookUpCodeValue(apiVersion || DEFAULT_API_VERSION, request),
}
