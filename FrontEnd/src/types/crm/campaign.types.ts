export enum CampaignType {
	Email = 'Email',
}

export interface SearchCampaignRequest {
	pageNumber: number
	pageSize: number
	sortOrder?: string
	sortField?: string
	searchText?: string
	campaignType?: CampaignType
}

export interface SearchCampaignLeadsRequest {
	pageNumber: number
	pageSize: number
	sortOrder?: string
	sortField?: string
	searchText?: string
}

export interface CreateCampaignRequest {
	title: string
	campaignType: CampaignType
	offeringId: number
	templateId: number
	scheduleDate: string
	message?: string
	leadIds: number[]
}

export interface CreateCampaignResponse {
	id: number
	message: string
}

export interface UpdateCampaignRequest {
	id: number
	title: string
	campaignType: CampaignType
	templateId: number
	scheduleDate: string
	message?: string
}

export interface ViewCampaignResponse {
	id: number
	title: string
	campaignType: CampaignType | string
	templateId: number
	templateName: string
	scheduleDate: string
	message?: string
	recipientCount: number
	createdOn: string
}

export interface ViewCampaignUserResponse {
	id: number
	userId: number
	contact: string
}

export interface ViewCampaignDetailResponse {
	id: number
	title: string
	campaignType: CampaignType | string
	templateId: number
	templateName: string
	scheduleDate: string
	message?: string
	createdOn: string
	campaignUsers: ViewCampaignUserResponse[]
}

export interface ViewCampaignLeadPickerResponse {
	id: number
	businessName: string
	ownerName: string
	email?: string
	mobile: string
}

export interface PaginationResponseOfViewCampaignResponse {
	data: ViewCampaignResponse[]
	currentPage: number
	totalPages: number
	totalCount: number
	pageSize: number
	hasPreviousPage: boolean
	hasNextPage: boolean
}

export interface PaginationResponseOfViewCampaignLeadPickerResponse {
	data: ViewCampaignLeadPickerResponse[]
	currentPage: number
	totalPages: number
	totalCount: number
	pageSize: number
	hasPreviousPage: boolean
	hasNextPage: boolean
}
