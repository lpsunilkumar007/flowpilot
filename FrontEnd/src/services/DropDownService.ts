import { dataControllersClient } from '@/helpers/api/apiClients'
import { DropDownItemResponse, LookUpCodeTypes, NexusLookUpCodeTypes, UserDropDownItemResponse, ViewCountryLocalizationResponse } from '@/helpers/api/WebApiClient'
import type { OfferingDropDownItemResponse } from '@/types/crm/offering.types'
import type { IDropDownRepository } from './contracts/IDropDownRepository'

const dropDownService: IDropDownRepository = {
	async getNexusLookUpCodeValues(type: NexusLookUpCodeTypes): Promise<DropDownItemResponse[]> {
		try {
			return (await dataControllersClient.getNexusLookUpCodeValues(type)) ?? []
		} catch {
			return []
		}
	},

	async getLookUpCodeValues(type: LookUpCodeTypes): Promise<DropDownItemResponse[]> {
		try {
			return (await dataControllersClient.getLookUpCodeValues(type)) ?? []
		} catch {
			return []
		}
	},

	async getSystemUsers(ignoreLoggedInUser: boolean): Promise<UserDropDownItemResponse[]> {
		return dataControllersClient.getSystemUsers(ignoreLoggedInUser)
	},

	async getDirectReportSystemUsers(): Promise<UserDropDownItemResponse[]> {
		return dataControllersClient.getDirectReportSystemUsers()
	},

	async getLocalizationCountries(): Promise<DropDownItemResponse[]> {
		return dataControllersClient.getLocalizationCountries()
	},

	async getCountryLocalization(id: number): Promise<ViewCountryLocalizationResponse[]> {
		try {
			return (await dataControllersClient.getCountryLocalization(id)) ?? []
		} catch {
			return []
		}
	},

	async getActiveOfferings(): Promise<OfferingDropDownItemResponse[]> {
		try {
			return ((await dataControllersClient.getActiveOfferings()) ?? []) as OfferingDropDownItemResponse[]
		} catch {
			return []
		}
	},

	async getEmailTemplates(): Promise<DropDownItemResponse[]> {
		try {
			return (await dataControllersClient.getEmailTemplates()) ?? []
		} catch {
			return []
		}
	},
}

/**
 * DropDown service - abstraction over dropdown lookup API.
 * Implements IDropDownRepository for consistency and testability.
 */
export const DropDownService = dropDownService

export interface MultiselectDropDownItems {
	value: string
	label: string
}
