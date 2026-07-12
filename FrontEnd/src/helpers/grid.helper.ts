import moment from 'moment'

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

export const defaultGridColDef = {
	//resizable: false,
	flex: 1,
	suppressMovable: true,
	sortable: true,
	minWidth: 200,
	cellClass: 'no-cell-focus',
}
