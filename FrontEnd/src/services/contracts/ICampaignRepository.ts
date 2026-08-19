import type {
    CreateCampaignRequest,
    CreateCampaignResponse,
    PaginationResponseOfViewCampaignLeadPickerResponse,
    PaginationResponseOfViewCampaignResponse,
    SearchCampaignLeadsRequest,
    SearchCampaignRequest,
    UpdateCampaignRequest,
    ViewCampaignDetailResponse,
} from '@/types/crm/campaign.types'

export interface ICampaignRepository {
	search(request: SearchCampaignRequest): Promise<PaginationResponseOfViewCampaignResponse>
	getById(id: number): Promise<ViewCampaignDetailResponse>
	getLeadsByOffering(offeringId: number, request: SearchCampaignLeadsRequest): Promise<PaginationResponseOfViewCampaignLeadPickerResponse>
	create(request: CreateCampaignRequest): Promise<CreateCampaignResponse>
	update(id: number, request: UpdateCampaignRequest): Promise<string>
}
