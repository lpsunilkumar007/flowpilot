export interface PipelineStage {

	id: number
	lookUpValue: string
	label: string
	headerClass: string

}

export type PipelineBoardState = Record<string, import('./lead.types').ViewLeadListResponse[]>
