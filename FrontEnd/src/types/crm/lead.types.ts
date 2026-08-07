export enum LeadActivityType {
	Call = 0,
	Meeting = 1,
	Demo = 2,
	Visit = 3,
	WhatsApp = 4,
	Email = 5,
	Proposal = 6,
	Note = 7,
	Task = 8,
}

export enum FollowUpStatus {
	Pending = 0,
	Completed = 1,
	Missed = 2,
	Cancelled = 3,
}

export enum FollowUpType {
	Call = 0,
	Meeting = 1,
	Demo = 2,
	Visit = 3,
	WhatsApp = 4,
	Email = 5,
	Other = 6,
}

export enum LeadPriority {
	Low = 0,
	Medium = 1,
	High = 2,
	Urgent = 3,
}

export enum InterestLevel {
	Low = 0,
	Medium = 1,
	High = 2,
}

export enum LeadFilterType {
	All = 0,
	MyLeads = 1,
	TodayFollowUps = 2,
	Overdue = 3,
	Interested = 4,
	Won = 5,
	Lost = 6,
	Archived = 7,
}

export enum EntityNoteType {
	Lead = 0,
	LeadSummary = 1,
	Customer = 2,
	Support = 3,
}

export interface SearchLeadRequest {
	pageNumber: number
	pageSize: number
	sortOrder?: string
	sortField?: string
	filterType?: LeadFilterType
	searchText?: string
	assignedToUserId?: string
	fromDate?: string
	toDate?: string
}

export interface CreateLeadRequest {
	businessName: string
	businessType: string
	currentPOS?: string
	website?: string
	gstNumber?: string
	pan?: string
	numberOfOutlets?: number
	expectedMonthlyBilling?: number
	expectedRevenue?: number
	companySize?: string
	ownerName: string
	designation?: string
	mobile: string
	whatsApp?: string
	email?: string
	alternatePhone?: string
	country?: string
	state?: string
	city?: string
	area?: string
	pincode?: string
	fullAddress?: string
	googleMapsLink?: string
	leadSourceId: number
	assignToYourself?: boolean
	assignedToUserId?: string
	priority?: LeadPriority | string
	leadStatusId?: number
	expectedClosingDate?: string
	interestLevel?: InterestLevel | string
	notes?: string
	painPoints?: string
	competitors?: string
	requirements?: string
}

export interface UpdateLeadRequest extends Omit<CreateLeadRequest, 'notes'> {
	id: number
	isArchived?: boolean
	leadStatusId: number
}

export interface UpdateLeadStatusRequest {
	leadStatusId: number
	remarks?: string
}

export interface AssignLeadRequest {
	assignToYourself?: boolean
	assignedToUserId?: string
	remarks?: string
}

export interface UpdateLeadFollowUpDateRequest {
	nextFollowUpDate: string
}

export interface CreateLeadActivityRequest {
	activityType: LeadActivityType | string
	activityDate: string
	activityTime?: string
	durationMinutes?: number
	outcome?: string
	notes?: string
	nextFollowUpDate?: string
	followUpType?: FollowUpType
	reminderNote?: string
}

export interface CreateEntityNoteRequest {
	entityNoteType: EntityNoteType
	noteText: string
}

export interface CreateLeadResponse {
	id: number
	message: string
}

export interface ViewLeadListResponse {
	id: number
	businessName: string
	ownerName: string
	mobile: string
	businessType: string
	currentPOS?: string
	assignedToUserId: string
	leadStatusId: number
	leadStatusName: string
	nextFollowUpDate?: string
	lastActivityDate?: string
	expectedRevenue?: number
	createdOn: string
	interestLevel: InterestLevel
	isArchived: boolean
}

export interface ViewLeadActivityResponse {
	id: number
	fkLeadPKId: number
	activityType: LeadActivityType | string
	activityDate: string
	activityTime?: string
	durationMinutes?: number
	outcome?: string
	notes?: string
	nextFollowUpDate?: string
	createdOn: string
}

export interface ViewLeadFollowUpResponse {
	id: number
	nextFollowUpDate: string
	followUpType: FollowUpType
	followUpStatus: FollowUpStatus
	reminderNote?: string
}

export interface ViewLeadStatusHistoryResponse {
	id: number
	fromStatusId?: number
	fromStatusName?: string
	toStatusId: number
	toStatusName: string
	changedByUserId: string
	changedOn: string
	remarks?: string
}

export interface ViewLeadAssignmentHistoryResponse {
	id: number
	fromUserId?: string
	toUserId: string
	assignedByUserId: string
	assignedOn: string
	remarks?: string
}

export interface ViewEntityNoteResponse {
	id: number
	entityNoteType: EntityNoteType
	fkEntityPKId: number
	noteText: string
	createdOn: string
}

export interface ViewLeadDetailResponse {
	id: number
	businessName: string
	businessType: string
	currentPOS?: string
	website?: string
	gstNumber?: string
	pan?: string
	numberOfOutlets?: number
	expectedMonthlyBilling?: number
	expectedRevenue?: number
	companySize?: string
	ownerName: string
	designation?: string
	mobile: string
	whatsApp?: string
	email?: string
	alternatePhone?: string
	country?: string
	state?: string
	city?: string
	area?: string
	pincode?: string
	fullAddress?: string
	googleMapsLink?: string
	leadSourceId: number
	leadSourceName: string
	assignedToUserId: string
	priority: LeadPriority | string
	leadStatusId: number
	leadStatusName: string
	expectedClosingDate?: string
	interestLevel: InterestLevel
	painPoints?: string
	competitors?: string
	requirements?: string
	lastActivityDate?: string
	nextFollowUpDate?: string
	isArchived: boolean
	convertedOn?: string
	fkConvertedCustomerId?: number
	createdOn: string
	activities: ViewLeadActivityResponse[]
	followUps: ViewLeadFollowUpResponse[]
	notes: ViewEntityNoteResponse[]
	statusHistories: ViewLeadStatusHistoryResponse[]
	assignmentHistories: ViewLeadAssignmentHistoryResponse[]
}

export interface PaginationResponseOfViewLeadListResponse {
	data: ViewLeadListResponse[]
	currentPage: number
	totalPages: number
	totalCount: number
	pageSize: number
	hasPreviousPage: boolean
	hasNextPage: boolean
}
