import type { PaginationResponseOfViewLeadListResponse, ViewLeadListResponse } from './lead.types'

export const PIPELINE_COLUMN_PAGE_SIZE = 50

export interface PipelineStage {
	id: number
	lookUpValue: string
	label: string
	headerClass: string
}

export interface PipelineColumnState {
	items: ViewLeadListResponse[]
	pageNumber: number
	totalCount: number
	hasMore: boolean
	loadingMore: boolean
	loadError: boolean
}

export type PipelineBoardState = Record<string, PipelineColumnState>

export const emptyPipelineColumn = (): PipelineColumnState => ({
	items: [],
	pageNumber: 0,
	totalCount: 0,
	hasMore: false,
	loadingMore: false,
	loadError: false,
})

export const pipelineColumnFromPage = (page: PaginationResponseOfViewLeadListResponse | undefined): PipelineColumnState => {
	const items = page?.data ?? []
	const totalCount = page?.totalCount ?? items.length
	return {
		items,
		pageNumber: page?.currentPage ?? 1,
		totalCount,
		hasMore: page?.hasNextPage ?? items.length < totalCount,
		loadingMore: false,
		loadError: false,
	}
}
