import type { DropDownItemResponse, LookUpCodeTypes, NexusLookUpCodeTypes, UserDropDownItemResponse, ViewCountryLocalizationResponse } from '@/helpers/api/WebApiClient'
import type { OfferingDropDownItemResponse } from '@/types/crm/offering.types'

export interface IDropDownRepository {
	getNexusLookUpCodeValues(type: NexusLookUpCodeTypes): Promise<DropDownItemResponse[]>
	getLookUpCodeValues(type: LookUpCodeTypes): Promise<DropDownItemResponse[]>
	getSystemUsers(ignoreLoggedInUser: boolean): Promise<UserDropDownItemResponse[]>
	getDirectReportSystemUsers(): Promise<UserDropDownItemResponse[]>
	getLocalizationCountries(): Promise<DropDownItemResponse[]>
	getCountryLocalization(id: number): Promise<ViewCountryLocalizationResponse[]>
	getActiveOfferings(): Promise<OfferingDropDownItemResponse[]>
	getEmailTemplates(): Promise<DropDownItemResponse[]>
}
