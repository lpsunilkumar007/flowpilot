import DataGridWithPagination from '@/components/DataGrid/DataGridWithPagination'
import { PagingVariables } from '@/constants/paging'
import { FormStatus, PaginationResponseOfViewFormStructureDetailResponse, SearchFormStructureRequest } from '@/helpers/api/WebApiClient'
import { gridHelper, GridSortingDetails } from '@/helpers/grid.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { formDesignerService } from '@/services/FormDesignerService'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ViewFormActionButton from './ViewFormDetailsActionButton'

interface ViewFormsProps {
	onActionClick: (id: number, action: string) => void
	reloadForms: boolean
}

type ModalState = {
	loading: boolean
}

const ViewFormDetails: React.FC<ViewFormsProps> = (props) => {
	const [formData, setFormData] = useState<PaginationResponseOfViewFormStructureDetailResponse>()
	const [gridSortingDetails, setGridSortingDetails] = useState<GridSortingDetails>({ sortField: 'name', sortOrder: 'desc' })
	const loadingIndicator = () => <AnimationSkeleton />
	const { t } = useTranslation()
	const [modalState, setModalState] = useState<ModalState>({
		loading: false,
	})

	const fetchFormInfo = async (page: number) => {
		assignValueToModal('loading', true)
		try {
			const searchRequest = new SearchFormStructureRequest({
				pageNumber: page,
				pageSize: PagingVariables.DefaultPageSize,
			})
			searchRequest.sortOrder = gridSortingDetails.sortOrder
			searchRequest.sortField = gridSortingDetails.sortField
			const response = await formDesignerService.getFormStructures(searchRequest)
			setFormData(response)
		} finally {
			assignValueToModal('loading', false)
		}
	}

	const assignValueToModal = (modalName: keyof ModalState, value: any) => {
		setModalState((prev) => ({
			...prev,
			[modalName]: value,
		}))
	}

	const [columnDefs] = useState([
		{
			field: 'name',
			headerName: t('Manage.Forms.Grid_Name', 'Name'),
			sortingOrder: ['asc', 'desc'],
			sort: 'asc',
			tooltipField: 'name',
			minWidth: 200,
		},
		{
			field: 'description',
			headerName: t('Manage.Forms.Grid_Description', 'Description'),
			tooltipField: 'description',
			minWidth: 250,
		},

		{
			field: 'formStatus',
			headerName: t('Manage.Forms.Grid_Status', 'Status'),
			cellRenderer: (params: any) => {
				const status = params.value
				const statusClass = status === FormStatus.Published ? 'orbit-pill orbit-pill--success' : status === FormStatus.Closed ? 'orbit-pill orbit-pill--danger' : status === FormStatus.Test ? 'orbit-pill orbit-pill--warning' : 'orbit-pill orbit-pill--neutral'
				return <span className={`ml-2 ${statusClass}`}>{status}</span>
			},
			minWidth: 150,
		},
		{
			field: 'id',
			headerName: t('Manage.Forms.Grid_Action', 'Actions'),
			sortable: false,
			minWidth: 200,
			flex: 1,
			cellRenderer: (params: any) => <ViewFormActionButton onActionClick={(id, number) => props.onActionClick(id, number)} id={params.data.id} />,
		},
	] as any)
	useEffect(() => {
		fetchFormInfo(0)
	}, [props.reloadForms])
	return (
		<>
			{modalState.loading
				? loadingIndicator()
				: formData && (
						<DataGridWithPagination
							rowData={formData}
							columnDefs={columnDefs}
							onSortChanged={(event) => {
								setGridSortingDetails(gridHelper.handleSortChanged(event))
							}}
							onPageChange={async (page) => {
								await fetchFormInfo(page)
							}}
						/>
				  )}
		</>
	)
}

export default ViewFormDetails
