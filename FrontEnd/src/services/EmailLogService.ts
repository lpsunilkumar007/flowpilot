import { emailLogClient } from '@/helpers/api/apiClients'
import type { IEmailLogRepository } from './contracts/IEmailLogRepository'

/**
 * Email log service - abstraction over email log API client.
 * Use this instead of importing emailLogClient directly for better testability.
 */
export const emailLogService: IEmailLogRepository = {
	getEmailLogList: (request) => emailLogClient.getEmailLogList(request),
	getEmailLogById: (id) => emailLogClient.getEmailLogById(id),
}
