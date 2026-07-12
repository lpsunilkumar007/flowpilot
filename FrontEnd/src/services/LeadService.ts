import { leadApiClient } from '@/helpers/api/LeadApiClient'
import type { ILeadRepository } from './contracts/ILeadRepository'

export const leadService: ILeadRepository = {
	search: (request) => leadApiClient.search(request),
	getById: (id) => leadApiClient.getById(id),
	create: (request) => leadApiClient.create(request),
	update: (id, request) => leadApiClient.update(id, request),
	updateStatus: (id, request) => leadApiClient.updateStatus(id, request),
	assign: (id, request) => leadApiClient.assign(id, request),
	getActivities: (id) => leadApiClient.getActivities(id),
	createActivity: (id, request) => leadApiClient.createActivity(id, request),
	getTodayFollowUps: () => leadApiClient.getTodayFollowUps(),
	getOverdueFollowUps: () => leadApiClient.getOverdueFollowUps(),
	getNotes: (id) => leadApiClient.getNotes(id),
	createNote: (id, request) => leadApiClient.createNote(id, request),
}
