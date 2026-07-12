import type {
	CreateCountryLocalizationRequest,
	CreateCountryLocalizationResponse,
	CreateCountryRequest,
	CreateCountryResponse,
	PaginationResponseOfViewCountryLocalizationResponse,
	SearchCountryLocalizationRequest,
	UpdateCountryLocalizationRequest,
	UpdateCountryRequest,
	ViewCountryLocalizationResponse,
	ViewCountryResponse,
} from '@/helpers/api/WebApiClient'

export interface ILocalizationRepository {
	getCountry(): Promise<ViewCountryResponse[]>
	getCountryById(id: number): Promise<ViewCountryResponse>
	createCountry(request: CreateCountryRequest): Promise<CreateCountryResponse>
	updateCountry(request: UpdateCountryRequest): Promise<string>
	deleteCountry(countryId: number): Promise<string>
	getCountryLocalization(request: SearchCountryLocalizationRequest): Promise<PaginationResponseOfViewCountryLocalizationResponse>
	getCountryLocalizationById(id: number): Promise<ViewCountryLocalizationResponse>
	createCountryLocalization(request: CreateCountryLocalizationRequest): Promise<CreateCountryLocalizationResponse>
	updateCountryLocalization(request: UpdateCountryLocalizationRequest): Promise<string>
}
