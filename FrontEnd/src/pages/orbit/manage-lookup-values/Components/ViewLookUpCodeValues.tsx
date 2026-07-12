import DataGridWithPagination from '@/components/DataGrid/DataGridWithPagination'
import { PagingVariables } from '@/constants/paging'
import { LookUpCodeTypes, PaginationResponseOfViewLookUpCodeValuesResponse, SearchLookUpCodeValuesRequest } from '@/helpers/api/WebApiClient'
import { gridHelper, GridSortingDetails } from '@/helpers/grid.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { lookUpService } from '@/services/LookUpService'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ViewLookUpCodeValuesActionButtons from './ViewLookUpCodeValuesActionButtons'

interface ViewLookUpCodeValuesProps {
	onActionClick: (id: number, action: string) => void
	lookUpCodeType: LookUpCodeTypes
	reloadLookUpCodeValues: boolean
}

const ViewLookUpCodeValues: React.FC<ViewLookUpCodeValuesProps> = (props) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(true)
	const [rowData, setRowData] = useState<PaginationResponseOfViewLookUpCodeValuesResponse>()
	const [gridSortingDetails, setGridSortingDetails] = useState<GridSortingDetails>({ sortField: 'lookUpValue', sortOrder: 'desc' })

	const loadingIndicator = () => <AnimationSkeleton />

	const fetchLookUpCodes = async (pageNumber: number) => {
		try {
			const searchModel = new SearchLookUpCodeValuesRequest()
			searchModel.type = props.lookUpCodeType
			searchModel.pageNumber = pageNumber
			searchModel.sortOrder = gridSortingDetails.sortOrder
			searchModel.sortField = gridSortingDetails.sortField
			searchModel.pageSize = PagingVariables.DefaultPageSize
			const response = await lookUpService.getLookUpCodeValues(searchModel)
			setRowData(response)
		} finally {
			setLoading(false)
		}
	}

	const [columnDefs] = useState([
		{ field: 'lookUpValue', headerName: t('Manage.Values.Grid_Name', 'Name'), sortingOrder: ['asc', 'desc'], sort: 'asc', minWidth: 200 },
		{ field: 'displayOrder', headerName: t('Manage.Values.Grid_DisplayOrder', 'Display Order'), minWidth: 200 },
		{
			sortable: false,
			field: 'isActive',
			headerName: t('Manage.Values.Grid_Status', 'Status'),
			cellRenderer: (params: any) => {
				const isActive: boolean = params.value
				return (
					<div>
						<span className={`ml-2 ${isActive ? 'orbit-pill orbit-pill--success' : 'orbit-pill orbit-pill--danger'}`}>{isActive ? 'Active' : 'Inactive'}</span>
					</div>
				)
			},
			minWidth: 150,
		},
		{
			field: 'id',
			sortable: false,
			headerName: t('Manage.Values.Grid_Actions', 'Actions'),
			cellClass: 'actions',
			minWidth: 200,
			flex: 1,
			cellRenderer: (params: any) => <ViewLookUpCodeValuesActionButtons onActionClick={(id, number) => props.onActionClick(id, number)} id={params.data.id} />,
		},
	] as any)

	useEffect(() => {
		const fetchData = async () => {
			await fetchLookUpCodes(0)
		}
		fetchData()
	}, [props.reloadLookUpCodeValues, gridSortingDetails])
	return (
		<>
			{loading && loadingIndicator()}
			{!loading && rowData && (
				<>
					<DataGridWithPagination
						rowData={rowData}
						columnDefs={columnDefs}
						onSortChanged={(event) => {
							setGridSortingDetails(gridHelper.handleSortChanged(event))
						}}
						onPageChange={async (page) => {
							await fetchLookUpCodes(page)
						}}
					/>
				</>
			)}
		</>
	)
}

export default ViewLookUpCodeValues
