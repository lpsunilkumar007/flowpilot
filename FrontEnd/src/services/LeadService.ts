import { leadClient } from '@/helpers/api/apiClients'
import type {
    AssignLeadRequest as ApiAssignLeadRequest,
    CreateEntityNoteRequest as ApiCreateEntityNoteRequest,
    CreateLeadActivityRequest as ApiCreateLeadActivityRequest,
    CreateLeadRequest as ApiCreateLeadRequest,
    LeadFilterType as ApiLeadFilterType,
    UpdateLeadFollowUpDateRequest as ApiUpdateLeadFollowUpDateRequest,
    UpdateLeadRequest as ApiUpdateLeadRequest,
    UpdateLeadStatusRequest as ApiUpdateLeadStatusRequest,
} from '@/helpers/api/WebApiClient'
import { sanitizeLeadApiPayload } from '@/pages/orbit/manage-leads/helpers/leadApiPayload.helper'
import moment from 'moment'
import type { ILeadRepository } from './contracts/ILeadRepository'

const toMoment = (value?: string | null) => (value ? moment(value) : undefined)

/** NSwag DTOs use Moment/string enums; UI keeps plain CRM types. */
const asUi = <T>(value: unknown) => value as T

export const leadService: ILeadRepository = {
	search: (request) =>
		asUi(
			leadClient.search(
				request.filterType as unknown as ApiLeadFilterType | undefined,
				request.searchText,
				request.assignedToUserId,
				request.offeringId,
				request.offeringUniqueId,
				toMoment(request.fromDate),
				toMoment(request.toDate),
				request.pageNumber,
				request.pageSize,
				request.sortOrder,
				request.sortField
			)
		),

	getById: (id) => asUi(leadClient.getById(id)),

	create: (request) =>
		asUi(leadClient.create(sanitizeLeadApiPayload(request) as unknown as ApiCreateLeadRequest)),

	update: (id, request) =>
		leadClient.update(id, sanitizeLeadApiPayload({ ...request, id }) as unknown as ApiUpdateLeadRequest),

	updateStatus: (id, request) =>
		leadClient.updateStatus(id, request as unknown as ApiUpdateLeadStatusRequest),

	assign: (id, request) =>
		leadClient.assign(id, sanitizeLeadApiPayload(request) as unknown as ApiAssignLeadRequest),

	updateFollowUpDate: (id, request) =>
		leadClient.updateFollowUpDate(
			id,
			sanitizeLeadApiPayload(request) as unknown as ApiUpdateLeadFollowUpDateRequest
		),

	getActivities: (id) => asUi(leadClient.getActivities(id)),

	createActivity: (id, request) =>
		asUi(
			leadClient.createActivity(
				id,
				sanitizeLeadApiPayload(request) as unknown as ApiCreateLeadActivityRequest
			)
		),

	getTodayFollowUps: () => asUi(leadClient.getTodayFollowUps()),

	getOverdueFollowUps: () => asUi(leadClient.getOverdueFollowUps()),

	getNotes: (id) => asUi(leadClient.getNotes(id)),

	createNote: (id, request) =>
		asUi(leadClient.createNote(id, request as unknown as ApiCreateEntityNoteRequest)),
}
