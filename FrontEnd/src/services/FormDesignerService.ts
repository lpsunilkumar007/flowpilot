import { formDesignerClient } from '@/helpers/api/apiClients'
import type { IFormDesignerRepository } from './contracts/IFormDesignerRepository'

/**
 * Form designer service - abstraction over form designer API client.
 * Use this instead of importing formDesignerClient directly for better testability.
 */
export const formDesignerService: IFormDesignerRepository = {
	getFormStructures: (request) => formDesignerClient.getFormStructures(request),
	getFormStructureById: (id) => formDesignerClient.getFormStructureById(id),
	createFormStructure: (request) => formDesignerClient.createFormStructure(request),
	updateFormStructure: (request) => formDesignerClient.updateFormStructure(request),
	deleteFormStructure: (id) => formDesignerClient.deleteFormStructure(id),
	getFormPages: (request) => formDesignerClient.getFormPages(request),
	getFormPageById: (id) => formDesignerClient.getFormPageById(id),
	createFormPage: (request) => formDesignerClient.createFormPage(request),
	updateFormPage: (request) => formDesignerClient.updateFormPage(request),
	deleteFormPage: (id) => formDesignerClient.deleteFormPage(id),
	getFormPageTabs: (request) => formDesignerClient.getFormPageTabs(request),
	getFormPageTabById: (id) => formDesignerClient.getFormPageTabById(id),
	createFormPageTab: (request) => formDesignerClient.createFormPageTab(request),
	updateFormPageTab: (request) => formDesignerClient.updateFormPageTab(request),
	deleteFormPagTab: (id) => formDesignerClient.deleteFormPagTab(id),
	getNumberFormFieldDetailPOST: (request) => formDesignerClient.getNumberFormFieldDetailPOST(request),
	createUpdateNumberFormFieldDetail: (id, request) => formDesignerClient.createUpdateNumberFormFieldDetail(id, request),
	getSelectFormFieldDetailPOST: (request) => formDesignerClient.getSelectFormFieldDetailPOST(request),
	createUpdateSelectFormFieldDetail: (id, request) => formDesignerClient.createUpdateSelectFormFieldDetail(id, request),
}
