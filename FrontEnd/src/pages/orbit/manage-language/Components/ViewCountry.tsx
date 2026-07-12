import DataGridWithoutPagination from '@/components/DataGrid/DataGridWithoutPagination'
import DeleteConfirmation from '@/components/DeleteConfirmation'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { messageHelper } from '@/helpers/message.helper'
import withSuspense from '@/helpers/suspense.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { localizationService } from '@/services/LocalizationService'
import React, { lazy, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ViewCountryProps {
	reload?: boolean
	onActionClick: (id: number, action: string) => void
}

const ViewCountryActionButtons = withSuspense(lazy(() => import('./ViewCountryActionButtons')))

const ViewCountry: React.FC<ViewCountryProps> = ({ reload, onActionClick }) => {
	const [loading, setLoading] = useState(true)
	const [rowData, setRowData] = useState<any[]>([])
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
	const [countryIdToDelete, setCountryIdToDelete] = useState<number | null>(null)
	const { t } = useTranslation()
	const loadingIndicator = () => <AnimationSkeleton />

	const columnDefs = [
		{
			field: 'countryName',
			headerName: t('Manage.Languages.Grid_CountryName', 'Country Name'),
			sort: 'asc',
			sortingOrder: ['asc', 'desc'],
			minWidth: 200,
		},
		{
			field: 'countryCode',
			headerName: t('Manage.Languages.Grid_CountryCode', 'Country Code'),
			minWidth: 200,
		},
		{
			field: 'displayOrder',
			headerName: t('Manage.Languages.Grid_DisplayOrder', 'Display Order'),
			minWidth: 200,
		},
		{
			field: 'actions',
			headerName: t('Manage.Languages.Grid_Actions', 'Actions'),
			minWidth: 250,
			flex: 1,
			cellRenderer: (params: any) => <ViewCountryActionButtons id={params.data.id} onActionClick={handleActionClick} />,
		},
	]

	const handleActionClick = (id: number, action: string) => {
		if (action === 'Delete') {
			setCountryIdToDelete(id)
			setShowDeleteConfirmation(true)
			return
		}
		onActionClick(id, action)
	}

	const fetchCountries = async () => {
		try {
			setLoading(true)
			const response = await localizationService.getCountry()
			setRowData(response)
		} finally {
			setLoading(false)
		}
	}

	const handleDelete = async () => {
		if (!countryIdToDelete) return
		await runWithToast(() => localizationService.deleteCountry(countryIdToDelete), {
			onSuccess: (response) => {
				messageHelper.showSuccess(response)
				setShowDeleteConfirmation(false)
				setCountryIdToDelete(null)
				fetchCountries()
				onActionClick(countryIdToDelete, 'Delete')
			},
		})
	}

	useEffect(() => {
		fetchCountries()
	}, [reload])

	return (
		<>
			{loading && loadingIndicator()}
			{!loading && <DataGridWithoutPagination rowData={rowData} columnDefs={columnDefs} />}
			{showDeleteConfirmation && (
				<DeleteConfirmation
					isOpen={showDeleteConfirmation}
					onClose={() => {
						setShowDeleteConfirmation(false)
						setCountryIdToDelete(null)
					}}
					onConfirm={handleDelete}
					title={t('Manage.Language.Delete_Title', 'Delete Country')}
					description={t('Manage.Language.Delete_Description', 'Are you sure you want to delete this country?')}
					confirmButtonText={t('Manage.Language.Delete_Confirm', 'Delete')}
				/>
			)}
		</>
	)
}

export default ViewCountry
