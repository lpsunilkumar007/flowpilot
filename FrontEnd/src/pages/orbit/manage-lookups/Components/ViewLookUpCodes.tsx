import DataGridWithoutPagination from '@/components/DataGrid/DataGridWithoutPagination'
import { LookUpCodeTypes, ViewLookUpsResponse } from '@/helpers/api/WebApiClient'
import { gridHelper } from '@/helpers/grid.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { lookUpService } from '@/services/LookUpService'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ViewLookUpCodesActionButtons from './ViewLookUpCodesActionButtons'

interface ViewLookUpCodesProps {
	onActionClick: (id: number, action: string, lookUpCodeType: LookUpCodeTypes) => void
}

const ViewLookUpCodes: React.FC<ViewLookUpCodesProps> = (props) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(true)
	const [rowData, setRowData] = useState<ViewLookUpsResponse[]>([])

	const loadingIndicator = () => <AnimationSkeleton />

	useEffect(() => {
		const fetchData = async () => {
			await fetchLookUpCodes()
		}
		fetchData()
	}, [])

	const fetchLookUpCodes = async () => {
		try {
			const response = await lookUpService.getLookUpCodes()
			setRowData(response)
		} finally {
			setLoading(false)
		}
	}

	const [columnDefs] = useState([
		{ field: 'description', headerName: t('Manage.Lookups.Grid_Name', 'Name'), sortingOrder: ['asc', 'desc'], comparator: gridHelper.sortingComparator, minWidth: 200 },
		{
			field: 'id',
			sortable: false,
			headerName: t('Manage.Lookups.Grid_Actions', 'Actions'),
			cellClass: 'actions',
			minWidth: 200,
			flex: 1,
			cellRenderer: (params: any) => <ViewLookUpCodesActionButtons onActionClick={(id, lookUpCodeType, action) => props.onActionClick(id, lookUpCodeType, action)} id={params.data.id} lookUpCodeType={params.data.lookUpCodeType} />,
		},
	] as any)

	return (
		<>
			{loading && loadingIndicator()}
			{!loading && <DataGridWithoutPagination rowData={rowData} columnDefs={columnDefs} />}
		</>
	)
}

export default ViewLookUpCodes
