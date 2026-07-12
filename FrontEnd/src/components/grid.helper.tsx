import { messageHelper } from '../helpers/message.helper'
export class gridHelper {
	static sortingComparator = (valueA: any, valueB: any) => {
		if (valueA == null) return -1
		if (valueB == null) return 1

		if (typeof valueA === 'string' && typeof valueB === 'string') {
			return valueA.localeCompare(valueB)
		}

		return valueA > valueB ? 1 : valueA < valueB ? -1 : 0
	}

	static handleSortChanged(event: any): GridSortingDetails {
		const sortModel = event.api
			.getColumnState()
			.filter((s: any) => s.sort != null)
			.map((s: any) => ({
				colId: s.colId,
				sort: s.sort,
				sortIndex: s.sortIndex,
			}))

		if (sortModel.length === 0) {
			const empty: GridSortingDetails = {
				sortField: '',
				sortOrder: '',
			}
			return empty
		}

		const first = sortModel[0]

		const result: GridSortingDetails = {
			sortField: first.colId,
			sortOrder: first.sort,
		}

		return result
	}

	static expandAll = (params: any) => {
		params.api.expandAll()
	}

	static collapseAll = (params: any) => {
		params.api.collapseAll()
	}
}

export interface GridSortingDetails {
	sortField: string
	sortOrder: string
}

export const renderCopyCell = (params: any) => {
	const value = params.value
	const handleCopy = () => {
		if (value) {
			navigator.clipboard.writeText(value)
			messageHelper.showSuccess('Copied to clipboard')
		}
	}

	return (
		<div className="flex items-center justify-between w-full h-full">
			<span className="truncate">{value}</span>
			{value && (
				<button onClick={handleCopy} className="btn btn-sm btn-link p-0 ml-2" title="Copy" style={{ minWidth: 'auto' }}>
					<i className="ri-file-copy-line text-primary"></i>
				</button>
			)}
		</div>
	)
}
