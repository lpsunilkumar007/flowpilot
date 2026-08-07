import type {
	AssignLeadRequest,
	CreateEntityNoteRequest,
	CreateLeadActivityRequest,
	CreateLeadRequest,
	CreateLeadResponse,
	PaginationResponseOfViewLeadListResponse,
	SearchLeadRequest,
	UpdateLeadRequest,
	UpdateLeadFollowUpDateRequest,
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
	updateStatus(id: number, request: UpdateLeadStatusRequest): Promise<string>
	assign(id: number, request: AssignLeadRequest): Promise<string>
	updateFollowUpDate(id: number, request: UpdateLeadFollowUpDateRequest): Promise<string>
	getActivities(id: number): Promise<ViewLeadActivityResponse[]>
	createActivity(id: number, request: CreateLeadActivityRequest): Promise<ViewLeadActivityResponse>
	getTodayFollowUps(): Promise<ViewLeadListResponse[]>
	getOverdueFollowUps(): Promise<ViewLeadListResponse[]>
	getNotes(id: number): Promise<ViewEntityNoteResponse[]>
	createNote(id: number, request: CreateEntityNoteRequest): Promise<ViewEntityNoteResponse>
}
