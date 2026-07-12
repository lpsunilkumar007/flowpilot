import { emailTemplateClient } from '@/helpers/api/apiClients'
import type { IEmailTemplateRepository } from './contracts/IEmailTemplateRepository'

/**
 * Email template service - abstraction over email template API client.
 * Use this instead of importing emailTemplateClient directly for better testability.
 */
export const emailTemplateService: IEmailTemplateRepository = {
	getEmailTemplates: (request) => emailTemplateClient.getEmailTemplates(request),
	getEmailTemplateById: (id) => emailTemplateClient.getEmailTemplateById(id),
	createEmailTemplate: (request) => emailTemplateClient.createEmailTemplate(request),
	updateEmailTemplate: (request) => emailTemplateClient.updateEmailTemplate(request),
	deleteEmailTemplate: (id) => emailTemplateClient.deleteEmailTemplate(id),
}
