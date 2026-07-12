import DataGridWithPagination from '@/components/DataGrid/DataGridWithPagination'
import { PagingVariables } from '@/constants/paging'
import { PaginationResponseOfViewEmailTemplateResponse, SearchEmailTemplateRequest } from '@/helpers/api/WebApiClient'
import { gridHelper, GridSortingDetails } from '@/helpers/grid.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { emailTemplateService } from '@/services/EmailTemplateService'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ViewEmailTemplatesActionButtons from './ViewEmailTemplatesActionButtons'

interface ViewEmailTemplatesProps {
	onActionClick: (id: number, action: string) => void
	reloadUsers: boolean
	reloadEmailTemplate: boolean
}
const ViewEmailTemplates: React.FC<ViewEmailTemplatesProps> = (props) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(true)
	const [rowData, setRowData] = useState<PaginationResponseOfViewEmailTemplateResponse>()
	const [gridSortingDetails, setGridSortingDetails] = useState<GridSortingDetails>({ sortField: 'name', sortOrder: 'desc' })
	const loadingIndicator = () => <AnimationSkeleton />

	const fetchEmailTemplate = async (pageNumber: number) => {
		try {
			const searchModel = new SearchEmailTemplateRequest()
			searchModel.pageNumber = pageNumber
			searchModel.sortOrder = gridSortingDetails.sortOrder
			searchModel.sortField = gridSortingDetails.sortField
			searchModel.pageSize = PagingVariables.DefaultPageSize
			const response = await emailTemplateService.getEmailTemplates(searchModel)
			setRowData(response)
		} finally {
			setLoading(false)
		}
	}

	const [columnDefs] = useState([
		{ field: 'name', headerName: t('Manage.EmailTemplates.Grid_Name', 'Name'), sortingOrder: ['asc', 'desc'], sort: 'asc', minWidth: 200 },
		{ field: 'description', headerName: t('Manage.EmailTemplates.Grid_Description', 'Description'), minWidth: 250 },
		{ field: 'templateUsedFor', headerName: t('Manage.EmailTemplates.Grid_TemplateUsedFor', 'Template Used For'), minWidth: 200 },
		{ field: 'emailSubject', headerName: t('Manage.EmailTemplates.Grid_EmailSubject', 'Email Subject'), minWidth: 250 },
		{
			field: 'isShared',
			headerName: t('Manage.EmailTemplates.Grid_IsShared', 'Is Shared'),
			cellRenderer: (params: any) => {
				const isShared: boolean = params.value
				return (
					<div>
						<span className={`ml-2 ${isShared ? 'orbit-pill orbit-pill--success' : 'orbit-pill orbit-pill--danger'}`}>{isShared ? 'Yes' : 'No'}</span>
					</div>
				)
			},
			minWidth: 150,
		},
		{
			field: 'id',
			sortable: false,
			headerName: t('Manage.EmailTemplates.Grid_Actions', 'Actions'),
			cellClass: 'actions',
			minWidth: 200,
			flex: 1,
			cellRenderer: (params: any) => <ViewEmailTemplatesActionButtons onActionClick={(id, action) => props.onActionClick(id, action)} id={params.data.id} />,
		},
	] as any)

	useEffect(() => {
		const fetchData = async () => {
			await fetchEmailTemplate(0)
		}
		fetchData()
	}, [props.reloadEmailTemplate, gridSortingDetails])
	return (
		<>
			{loading && loadingIndicator()}
			{!loading && rowData && (
				<DataGridWithPagination
					rowData={rowData}
					columnDefs={columnDefs}
					onSortChanged={(event) => {
						setGridSortingDetails(gridHelper.handleSortChanged(event))
					}}
					onPageChange={async (page) => {
						await fetchEmailTemplate(page)
					}}
				/>
			)}
		</>
	)
}

export default ViewEmailTemplates
