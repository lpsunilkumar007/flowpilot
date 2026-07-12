import DataGridWithPagination from '@/components/DataGrid/DataGridWithPagination'
import { PagingVariables } from '@/constants/paging'
import { PaginationResponseOfViewCountryLocalizationResponse, SearchCountryLocalizationRequest } from '@/helpers/api/WebApiClient'
import withSuspense from '@/helpers/suspense.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { localizationService } from '@/services/LocalizationService'
import React, { lazy, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const ViewLocalizationActionButtons = withSuspense(lazy(() => import('./ViewLocalizationActionButtons')))

interface Props {
	countryId: string
	reload: boolean
	onActionClick: (id: number, action: string) => void
}

const ViewLocalization: React.FC<Props> = ({ countryId, reload, onActionClick }) => {
	const [rowData, setRowData] = useState<PaginationResponseOfViewCountryLocalizationResponse>()
	const [loading, setLoading] = useState(true)

	const { t } = useTranslation()

	const columnDefs = [
		{
			field: 'key',
			headerName: t('Manage.Localization.Grid_Key', 'Key'),
			sort: 'asc',
			minWidth: 200,
		},
		{
			field: 'value',
			headerName: t('Manage.Localization.Grid_Value', 'Value'),
			minWidth: 200,
		},
		{
			field: 'actions',
			headerName: t('Manage.Localization.Grid_Actions', 'Actions'),
			minWidth: 200,
			flex: 1,
			cellRenderer: (params: any) => <ViewLocalizationActionButtons id={params.data.id} onActionClick={onActionClick} />,
		},
	]

	const fetchLocalizations = async (page: number) => {
		try {
			setLoading(true)
			const res = await localizationService.getCountryLocalization({
				countryId: Number(countryId),
				pageNumber: page,
				pageSize: PagingVariables.DefaultPageSize,
			} as SearchCountryLocalizationRequest)
			setRowData(res)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (countryId) fetchLocalizations(1)
	}, [countryId, reload])

	return (
		<>
			{loading && <AnimationSkeleton />}

			{!loading && rowData && (
				<DataGridWithPagination
					rowData={rowData}
					columnDefs={columnDefs}
					onPageChange={async (page) => {
						await fetchLocalizations(page)
					}}
				/>
			)}
		</>
	)
}

export default ViewLocalization
