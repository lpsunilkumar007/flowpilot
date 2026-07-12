import { defaultGridColDef } from '@/helpers/grid.helper'
import { useGridReady } from '@/hooks/agGrid'
import { AgGridReact } from 'ag-grid-react'
import Pagination from '../Pagination'

interface DataGridWithPaginationProps {
	rowData: any
	columnDefs: any[]
	onSortChanged?: (event: any) => void
	onPageChange: (page: number) => Promise<void> | void
	className?: string
}

const DataGridWithPagination: React.FC<DataGridWithPaginationProps> = (props) => {
	const onGridReady = useGridReady()

	return (
		<>
			<div className={`ag-theme-quartz w-full suppressCellSelection ${props.className}`.trim()}>
				<AgGridReact theme="legacy" rowData={props.rowData.data} columnDefs={props.columnDefs} onSortChanged={props.onSortChanged} onGridReady={onGridReady} suppressRowTransform domLayout="autoHeight" defaultColDef={defaultGridColDef} tooltipShowDelay={0} />

				<Pagination currentPage={props.rowData.currentPage} totalPages={props.rowData.totalPages} hasPreviousPage={props.rowData.hasPreviousPage} hasNextPage={props.rowData.hasNextPage} onPageChange={props.onPageChange} />
			</div>
		</>
	)
}

export default DataGridWithPagination
