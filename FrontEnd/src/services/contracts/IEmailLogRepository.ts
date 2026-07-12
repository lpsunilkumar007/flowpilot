import type { PaginationResponseOfViewEmailLogResponse, SearchEmailLogRequest, ViewEmailLogDetailResponse } from '@/helpers/api/WebApiClient'

export interface IEmailLogRepository {
	getEmailLogList(request: SearchEmailLogRequest): Promise<PaginationResponseOfViewEmailLogResponse>
	getEmailLogById(id: number): Promise<ViewEmailLogDetailResponse>
}
