import type { DropDownItemResponse, LookUpCodeTypes, NexusLookUpCodeTypes, UserDropDownItemResponse, ViewCountryLocalizationResponse } from '@/helpers/api/WebApiClient'

export interface IDropDownRepository {
	getNexusLookUpCodeValues(type: NexusLookUpCodeTypes): Promise<DropDownItemResponse[]>
	getLookUpCodeValues(type: LookUpCodeTypes): Promise<DropDownItemResponse[]>
	getSystemUsers(ignoreLoggedInUser: boolean): Promise<UserDropDownItemResponse[]>
	getLocalizationCountries(): Promise<DropDownItemResponse[]>
	getCountryLocalization(id: number): Promise<ViewCountryLocalizationResponse[]>
}
