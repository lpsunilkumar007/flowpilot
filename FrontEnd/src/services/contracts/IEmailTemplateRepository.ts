import type {
	CreateEmailTemplateRequest,
	CreateEmailTemplateResponse,
	PaginationResponseOfViewEmailTemplateResponse,
	SearchEmailTemplateRequest,
	UpdateEmailTemplateRequest,
	ViewEmailTemplateDetailResponse,
} from '@/helpers/api/WebApiClient'

export interface IEmailTemplateRepository {
	getEmailTemplates(request: SearchEmailTemplateRequest): Promise<PaginationResponseOfViewEmailTemplateResponse>
	getEmailTemplateById(id: number): Promise<ViewEmailTemplateDetailResponse>
	createEmailTemplate(request: CreateEmailTemplateRequest): Promise<CreateEmailTemplateResponse>
	updateEmailTemplate(request: UpdateEmailTemplateRequest): Promise<string>
	deleteEmailTemplate(id: number): Promise<string>
}
