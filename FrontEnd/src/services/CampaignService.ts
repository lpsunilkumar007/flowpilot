import { campaignClient } from '@/helpers/api/apiClients'
import type {
	CampaignType as ApiCampaignType,
	CreateCampaignRequest as ApiCreateCampaignRequest,
	UpdateCampaignRequest as ApiUpdateCampaignRequest,
} from '@/helpers/api/WebApiClient'
import moment from 'moment'
import type { ICampaignRepository } from './contracts/ICampaignRepository'

/** NSwag DTOs use Moment/string enums; UI keeps plain CRM types. */
const asUi = <T>(value: unknown) => value as T

export const campaignService: ICampaignRepository = {
	search: (request) =>
		asUi(
			campaignClient.search(
				request.searchText,
				request.campaignType as unknown as ApiCampaignType | null | undefined,
				request.pageNumber,
				request.pageSize,
				request.sortOrder,
				request.sortField
			)
		),

	getById: (id) => asUi(campaignClient.getById(id)),

	getLeadsByOffering: (offeringId) => asUi(campaignClient.getLeadsByOffering(offeringId)),

	create: (request) =>
		asUi(
			campaignClient.create({
				title: request.title,
				campaignType: request.campaignType as unknown as ApiCampaignType,
				offeringId: request.offeringId,
				templateId: request.templateId,
				scheduleDate: moment(request.scheduleDate),
				message: request.message,
				leadIds: request.leadIds,
			} as ApiCreateCampaignRequest)
		),

	update: (id, request) =>
		campaignClient.update(id, {
			id,
			title: request.title,
			campaignType: request.campaignType as unknown as ApiCampaignType,
			templateId: request.templateId,
			scheduleDate: moment(request.scheduleDate),
			message: request.message,
		} as ApiUpdateCampaignRequest),
}
