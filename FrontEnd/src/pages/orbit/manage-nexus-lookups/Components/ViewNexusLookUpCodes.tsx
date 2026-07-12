import DataGridWithoutPagination from '@/components/DataGrid/DataGridWithoutPagination'
import { NexusLookUpCodeTypes, ViewNexusLookUpsResponse } from '@/helpers/api/WebApiClient'
import { gridHelper } from '@/helpers/grid.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { nexusLookUpService } from '@/services/NexusLookUpService'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ViewNexusLookUpCodesActionButtons from './ViewNexusLookUpCodesActionButtons'
interface ViewNexusLookUpCodesProps {
	onActionClick: (id: number, action: string, lookUpCodeType: NexusLookUpCodeTypes) => void
}

const ViewNexusLookUpCodes: React.FC<ViewNexusLookUpCodesProps> = (props) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(true)
	const [rowData, setRowData] = useState<ViewNexusLookUpsResponse[]>([])

	const loadingIndicator = () => <AnimationSkeleton />

	useEffect(() => {
		const fetchData = async () => {
			await fetchLookUpCodes()
		}
		fetchData()
	}, [])

	const fetchLookUpCodes = async () => {
		try {
			const response = await nexusLookUpService.getLookUpCodes('1')
			setRowData(response)
		} finally {
			setLoading(false)
		}
	}

	const [columnDefs] = useState([
		{ field: 'description', headerName: t('Manage.Nexus.Lookups.Grid_Name', 'Name'), sortingOrder: ['asc', 'desc'], comparator: gridHelper.sortingComparator, minWidth: 250 },
		{
			field: 'id',
			sortable: false,
			headerName: t('Manage.Nexus.Lookups.Grid_Actions', 'Actions'),
			cellClass: 'actions',
			minWidth: 200,
			flex: 1,
			cellRenderer: (params: any) => <ViewNexusLookUpCodesActionButtons onActionClick={(id, lookUpCodeType, action) => props.onActionClick(id, lookUpCodeType, action)} id={params.data.id} nexusLookUpCodeType={params.data.lookUpCodeType} />,
		},
	] as any)

	return (
		<>
			{loading && loadingIndicator()}
			{!loading && <DataGridWithoutPagination rowData={rowData} columnDefs={columnDefs} />}
		</>
	)
}

export default ViewNexusLookUpCodes
