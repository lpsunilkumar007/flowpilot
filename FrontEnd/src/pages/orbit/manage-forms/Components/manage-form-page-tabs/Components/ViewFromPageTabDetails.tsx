import DataGridWithPagination from '@/components/DataGrid/DataGridWithPagination'
import { PagingVariables } from '@/constants/paging'
import { PaginationResponseOfViewFormPageTabDetailResponse, SearchFormPageTabRequest } from '@/helpers/api/WebApiClient'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { gridHelper, GridSortingDetails } from '@/helpers/grid.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { formDesignerService } from '@/services/FormDesignerService'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ViewFormPageTabActionButton from './ViewFormPageTabActionButton'

interface ViewFromPageTabDetailsProps {
	formPageId: number
	onActionClick: (id: number, action: string) => void
	reloadFormPageTabs: boolean
}
const ViewFromPageTabDetails: React.FC<ViewFromPageTabDetailsProps> = (props) => {
	const [loading, setLoading] = useState<boolean>(false)
	const [formPageTabData, setFromPageTabData] = useState<PaginationResponseOfViewFormPageTabDetailResponse>()
	const { t } = useTranslation()
	const [gridSortingDetails, setGridSortingDetails] = useState<GridSortingDetails>({ sortField: 'displayOrder', sortOrder: 'desc' })
	const fetchData = async (pageNumber: number) => {
		await runWithToast(
			async () => {
				const request = new SearchFormPageTabRequest({
					fkFormPagePKId: props.formPageId,
					pageNumber: pageNumber,
					pageSize: PagingVariables.DefaultPageSize,
					sortField: gridSortingDetails.sortField,
					sortOrder: gridSortingDetails.sortOrder,
				})
				request.fkFormPagePKId = props.formPageId
				return formDesignerService.getFormPageTabs(request)
			},
			{
				setLoading,
				onSuccess: (response) => setFromPageTabData(response),
			}
		)
	}
	const [columnDefs] = useState([
		{
			field: 'name',
			headerName: t('Manage.FormPage.Tabs.Grid_Name', 'Name'),
			tooltipField: 'name',
			minWidth: 200,
		},
		{
			field: 'parentTabName',
			headerName: t('Manage.FormPage.Tabs.Grid_ParentTab', 'Parent Tab'),
			tooltipField: 'parentTabName',
			minWidth: 200,
		},
		{
			field: 'displayOrder',
			headerName: t('Manage.FormPage.Tabs.Grid_DisplayOrder', 'Display Order'),
			sortingOrder: ['asc', 'desc'],
			sort: 'asc',
			tooltipField: 'displayOrder',
			minWidth: 200,
		},

		{
			field: 'id',
			headerName: t('Manage.FormPage.Tabs.Grid_Action', 'Action'),
			sortable: false,
			minWidth: 200,
			flex: 1,
			cellRenderer: (params: any) => <ViewFormPageTabActionButton onActionClick={(id, number) => props.onActionClick(id, number)} tabId={params.data.id} />,
		},
	] as any)
	useEffect(() => {
		fetchData(0)
	}, [props.reloadFormPageTabs])
	return (
		<>
			{loading ? (
				<div className="p-6">{<AnimationSkeleton />}</div>
			) : (
				formPageTabData &&
				formPageTabData.data && (		
							<DataGridWithPagination
								rowData={formPageTabData}
								columnDefs={columnDefs}
								onSortChanged={(event) => {
									setGridSortingDetails(gridHelper.handleSortChanged(event))
								}}
								onPageChange={async (page) => {
									await fetchData(page)
								}}
							/>
				)
			)}
		</>
	)
}

export default ViewFromPageTabDetails
