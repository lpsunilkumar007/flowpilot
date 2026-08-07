export enum MyTeamRelation {
	Direct = 'Direct',
	Indirect = 'Indirect',
}

export interface MyTeamSummaryResponse {
	hasReports: boolean
	directCount: number
	indirectCount: number
}

export interface MyTeamMemberResponse {
	userId: string
	firstName: string
	lastName: string
	email?: string | null
	isActive: boolean
	relation: MyTeamRelation | string
}

export interface MyTeamStatsSliceResponse {
	key: string
	label: string
	count: number
	memberIds: string[]
}

export interface MyTeamStatsResponse {
	leadStatus: MyTeamStatsSliceResponse[]
	taskProgress: MyTeamStatsSliceResponse[]
	leadInterest: MyTeamStatsSliceResponse[]
}
