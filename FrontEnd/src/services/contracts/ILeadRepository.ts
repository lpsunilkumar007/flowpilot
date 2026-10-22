import type {
    AssignLeadRequest,
    CreateEntityNoteRequest,
    CreateLeadActivityRequest,
    CreateLeadRequest,
    CreateLeadResponse,
    PaginationResponseOfViewLeadListResponse,
    SearchLeadRequest,
    UpdateLeadActivityRequest,
    UpdateLeadFollowUpDateRequest,
    UpdateLeadFollowUpRequest,
    UpdateLeadRequest,
    UpdateLeadStatusRequest,
    ViewEntityNoteResponse,
    ViewLeadActivityResponse,
    ViewLeadDetailResponse,
    ViewLeadListResponse,
} from '@/types/crm/lead.types'

export interface ILeadRepository {
	search(request: SearchLeadRequest): Promise<PaginationResponseOfViewLeadListResponse>
	getById(id: number): Promise<ViewLeadDetailResponse>
	create(request: CreateLeadRequest): Promise<CreateLeadResponse>
	update(id: number, request: UpdateLeadRequest): Promise<string>
	delete(id: number): Promise<string>
	updateStatus(id: number, request: UpdateLeadStatusRequest): Promise<string>
	assign(id: number, request: AssignLeadRequest): Promise<string>
	updateFollowUpDate(id: number, request: UpdateLeadFollowUpDateRequest): Promise<string>
	updateFollowUp(leadId: number, followUpId: number, request: UpdateLeadFollowUpRequest): Promise<string>
	cancelFollowUp(leadId: number, followUpId: number): Promise<string>
	getActivities(id: number): Promise<ViewLeadActivityResponse[]>
	createActivity(id: number, request: CreateLeadActivityRequest): Promise<ViewLeadActivityResponse>
	updateActivity(leadId: number, activityId: number, request: UpdateLeadActivityRequest): Promise<string>
	deleteActivity(leadId: number, activityId: number): Promise<string>
	getTodayFollowUps(): Promise<ViewLeadListResponse[]>
	getOverdueFollowUps(): Promise<ViewLeadListResponse[]>
	getNotes(id: number): Promise<ViewEntityNoteResponse[]>
	createNote(id: number, request: CreateEntityNoteRequest): Promise<ViewEntityNoteResponse>
}
