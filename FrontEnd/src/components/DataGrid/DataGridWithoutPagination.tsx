import { useGridReady } from '@/hooks/agGrid'
import { defaultGridColDef } from '@/helpers/grid.helper'
import { AgGridReact } from 'ag-grid-react'

interface DataGridWithoutPaginationProps {
	rowData: any
	columnDefs: any[]
	onSortChanged?: (event: any) => void
	className?: string
}

const DataGridWithoutPagination: React.FC<DataGridWithoutPaginationProps> = (props) => {
	const onGridReady = useGridReady()
	return (
		<div className={`ag-theme-quartz w-full suppressCellSelection ${props.className}`.trim()}>
			<AgGridReact theme="legacy" rowData={props.rowData} columnDefs={props.columnDefs} onSortChanged={props.onSortChanged} onGridReady={onGridReady} suppressRowTransform domLayout="autoHeight" defaultColDef={defaultGridColDef} tooltipShowDelay={0} />
		</div>
	)
}

export default DataGridWithoutPagination
