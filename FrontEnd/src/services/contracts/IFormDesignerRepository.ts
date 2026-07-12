import type {
	CreateFormPageFieldNumberRequest,
	CreateFormPageFieldSelectRequest,
	CreateFormPageRequest,
	CreateFormPageResponse,
	CreateFormPageTabRequest,
	CreateFormPageTabResponse,
	CreateFormStructureRequest,
	CreateFormStructureResponse,
	GetFormPageFieldModelsRequest,
	PaginationResponseOfViewFormPageDetailResponse,
	PaginationResponseOfViewFormPageTabDetailResponse,
	PaginationResponseOfViewFormStructureDetailResponse,
	SearchFormPageRequest,
	SearchFormPageTabRequest,
	SearchFormStructureRequest,
	UpdateFormPageRequest,
	UpdateFormPageTabRequest,
	UpdateFormStructureRequest,
	ViewFormPageDetailResponse,
	ViewFormPageTabDetailResponse,
	ViewFormStructureDetailResponse,
} from '@/helpers/api/WebApiClient'

export interface IFormDesignerRepository {
	getFormStructures(request: SearchFormStructureRequest): Promise<PaginationResponseOfViewFormStructureDetailResponse>
	getFormStructureById(id: number): Promise<ViewFormStructureDetailResponse>
	createFormStructure(request: CreateFormStructureRequest): Promise<CreateFormStructureResponse>
	updateFormStructure(request: UpdateFormStructureRequest): Promise<string>
	deleteFormStructure(id: number): Promise<string>
	getFormPages(request: SearchFormPageRequest): Promise<PaginationResponseOfViewFormPageDetailResponse>
	getFormPageById(id: number): Promise<ViewFormPageDetailResponse>
	createFormPage(request: CreateFormPageRequest): Promise<CreateFormPageResponse>
	updateFormPage(request: UpdateFormPageRequest): Promise<string>
	deleteFormPage(id: number): Promise<string>
	getFormPageTabs(request: SearchFormPageTabRequest): Promise<PaginationResponseOfViewFormPageTabDetailResponse>
	getFormPageTabById(id: number): Promise<ViewFormPageTabDetailResponse>
	createFormPageTab(request: CreateFormPageTabRequest): Promise<CreateFormPageTabResponse>
	updateFormPageTab(request: UpdateFormPageTabRequest): Promise<string>
	deleteFormPagTab(id: number): Promise<string>
	getNumberFormFieldDetailPOST(request: GetFormPageFieldModelsRequest): Promise<CreateFormPageFieldNumberRequest>
	createUpdateNumberFormFieldDetail(id: number, request: CreateFormPageFieldNumberRequest): Promise<CreateFormPageFieldNumberRequest>
	getSelectFormFieldDetailPOST(request: GetFormPageFieldModelsRequest): Promise<CreateFormPageFieldSelectRequest>
	createUpdateSelectFormFieldDetail(id: number, request: CreateFormPageFieldSelectRequest): Promise<CreateFormPageFieldSelectRequest>
}
