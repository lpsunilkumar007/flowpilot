import { DropDownItemResponse, LookUpCodeTypes, NexusLookUpCodeTypes, ViewCountryLocalizationResponse } from '@/helpers/api/WebApiClient'
import { dataControllersClient } from '@/helpers/api/apiClients'
import type { IDropDownRepository } from './contracts/IDropDownRepository'

const dropDownService: IDropDownRepository = {
	async getNexusLookUpCodeValues(type: NexusLookUpCodeTypes): Promise<DropDownItemResponse[]> {
		try {
			return await dataControllersClient.getNexusLookUpCodeValues(type)
		} catch {
			return []
		}
	},

	async getLookUpCodeValues(type: LookUpCodeTypes): Promise<DropDownItemResponse[]> {
		try {
			return await dataControllersClient.getLookUpCodeValues(type)
		} catch {
			return []
		}
	},

	async getSystemUsers(ignoreLoggedInUser: boolean) {
		return dataControllersClient.getSystemUsers(ignoreLoggedInUser)
	},

	async getDirectReportSystemUsers() {
		return dataControllersClient.getDirectReportSystemUsers()
	},

	async getLocalizationCountries() {
		return dataControllersClient.getLocalizationCountries()
	},

	async getCountryLocalization(id: number): Promise<ViewCountryLocalizationResponse[]> {
		try {
			return await dataControllersClient.getCountryLocalization(id)
		} catch {
			return []
		}
	},
}

/**
 * DropDown service - abstraction over data lookup API client.
 * Implements IDropDownRepository for consistency and testability.
 */
export const DropDownService = dropDownService

export interface MultiselectDropDownItems {
	value: string
	label: string
}
