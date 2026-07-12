import { localizationClient } from '@/helpers/api/apiClients'
import type { ILocalizationRepository } from './contracts/ILocalizationRepository'

/**
 * Localization service - abstraction over localization API client.
 * Use this instead of importing localizationClient directly for better testability.
 */
export const localizationService: ILocalizationRepository = {
	getCountry: () => localizationClient.getCountry(),
	getCountryById: (id) => localizationClient.getCountryById(id),
	createCountry: (request) => localizationClient.createCountry(request),
	updateCountry: (request) => localizationClient.updateCountry(request),
	deleteCountry: (countryId) => localizationClient.deleteCountry(countryId),
	getCountryLocalization: (request) => localizationClient.getCountryLocalization(request),
	getCountryLocalizationById: (id) => localizationClient.getCountryLocalizationById(id),
	createCountryLocalization: (request) => localizationClient.createCountryLocalization(request),
	updateCountryLocalization: (request) => localizationClient.updateCountryLocalization(request),
}
