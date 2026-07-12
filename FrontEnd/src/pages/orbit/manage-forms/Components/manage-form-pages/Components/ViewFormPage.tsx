import DataGridWithPagination from '@/components/DataGrid/DataGridWithPagination'
import { PagingVariables } from '@/constants/paging'
import { PaginationResponseOfViewFormPageDetailResponse, SearchFormPageRequest } from '@/helpers/api/WebApiClient'
import { gridHelper, GridSortingDetails } from '@/helpers/grid.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { formDesignerService } from '@/services/FormDesignerService'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ViewFormPageActionButton from './ViewFormPageButton'

interface ViewFormPageProps {
	formStructureId: number
	reloadFormPage: boolean
	onActionClick: (pageId: number, action: string) => void
}

type ModalState = {
	loading: boolean
	selectedIndex: number
}

const ViewFormPages: React.FC<ViewFormPageProps> = (props) => {
	const { t } = useTranslation()
	const loadingIndicator = () => <AnimationSkeleton />
	const [modalState, setModalState] = useState<ModalState>({
		loading: false,
		selectedIndex: 0,
	})
	const [formPages, setFormPages] = useState<PaginationResponseOfViewFormPageDetailResponse>()
	const [gridSortingDetails, setGridSortingDetails] = useState<GridSortingDetails>({ sortField: 'displayOrder', sortOrder: 'desc' })

	const assignValueToModal = (modalName: keyof ModalState, value: any) => {
		setModalState((prev) => ({
			...prev,
			[modalName]: value,
		}))
	}

	const fetchFormPages = async (pageNumber: number) => {
		assignValueToModal('loading', true)
		try {
			const request = new SearchFormPageRequest({
				fkFormStructurePKId: props.formStructureId,
				pageNumber: pageNumber,
				pageSize: PagingVariables.DefaultPageSize,
				sortField: gridSortingDetails.sortField,
				sortOrder: gridSortingDetails.sortOrder,
			})
			request.fkFormStructurePKId = props.formStructureId
			const response = await formDesignerService.getFormPages(request)
			setFormPages(response)
		} finally {
			assignValueToModal('loading', false)
		}
	}

	const [columnDefs] = useState([
		{
			field: 'title',
			headerName: t('Manage.Form.FormPages.Grid_Title', 'Title'),
			tooltipField: 'title',
			minWidth: 200,
		},
		{
			field: 'description',
			headerName: t('Manage.Form.FormPages.Grid_Description', 'Description'),
			tooltipField: 'description',
			minWidth: 250,
		},
		{
			field: 'displayOrder',
			headerName: t('Manage.Form.FormPages.Grid_DisplayOrder'),
			sortingOrder: ['asc', 'desc'],
			sort: 'asc',
			tooltipField: 'displayOrder',
			minWidth: 200,
		},

		{
			field: 'id',
			headerName: t('Manage.Form.FormPages.Grid_Action', 'Action'),
			sortable: false,
			minWidth: 200,
			flex: 1,
			cellRenderer: (params: any) => <ViewFormPageActionButton onActionClick={(id, number) => props.onActionClick(id, number)} id={params.data.id} />,
		},
	] as any)

	useEffect(() => {
		fetchFormPages(0)
	}, [props.reloadFormPage])

	return (
		<>
			{modalState.loading ? (
				<div className="p-6">{loadingIndicator()}</div>
			) : (
				formPages &&
				formPages.data && (
					
						
							<>
								<DataGridWithPagination
									rowData={formPages}
									columnDefs={columnDefs}
									onSortChanged={(event) => {
										setGridSortingDetails(gridHelper.handleSortChanged(event))
									}}
									onPageChange={async (page) => {
										await fetchFormPages(page)
									}}
								/>
							</>
						
					
				)
			)}
		</>
	)
}

export default ViewFormPages
