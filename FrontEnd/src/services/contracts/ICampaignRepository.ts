import type {
    CreateCampaignRequest,
    CreateCampaignResponse,
    PaginationResponseOfViewCampaignResponse,
    SearchCampaignRequest,
    UpdateCampaignRequest,
    ViewCampaignDetailResponse,
    ViewCampaignLeadPickerResponse,
} from '@/types/crm/campaign.types'

export interface ICampaignRepository {
	search(request: SearchCampaignRequest): Promise<PaginationResponseOfViewCampaignResponse>
	getById(id: number): Promise<ViewCampaignDetailResponse>
	getLeadsByOffering(offeringId: number): Promise<ViewCampaignLeadPickerResponse[]>
	create(request: CreateCampaignRequest): Promise<CreateCampaignResponse>
	update(id: number, request: UpdateCampaignRequest): Promise<string>
}
