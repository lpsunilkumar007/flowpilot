import { PageBreadcrumbsWithLinks } from '@/components'
import DataGridWithoutPagination from '@/components/DataGrid/DataGridWithoutPagination'
import { MenuLinks } from '@/constants/menu'
import { SettingTypes } from '@/helpers/api/WebApiClient'
import { gridHelper } from '@/helpers/grid.helper'
import { useSettings } from '@/hooks/useSettings'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import React from 'react'
import { useTranslation } from 'react-i18next'
import ViewSettingsListActionButton from './ViewSettingsActionButton'
import { PageBody, PageWrapper } from '@/components/PageWrapper'

interface ViewSettingsListProps {
	onActionClick: (id: number, action: string, settingType: SettingTypes) => void
}

const ViewSettings: React.FC<ViewSettingsListProps> = (props) => {
	const { t } = useTranslation()
	const { settings: rowData, loading } = useSettings()
	const loadingIndicator = () => <AnimationSkeleton />

	const columnDefs = [
		{ headerName: t('Manage.Settings.Grid_Description', 'Description'), field: 'description', sortingOrder: ['asc', 'desc'], comparator: gridHelper.sortingComparator, minWidth: 250 },
		{
			headerName: t('Manage.Settings.Grid_Actions', 'Actions'),
			cellClass: 'actions',
			field: 'id',
			cellRenderer: (params: any) => <ViewSettingsListActionButton onActionClick={(id, action, settingType) => props.onActionClick(id, action, settingType)} id={params.data.id} settingType={params.data.settingType} />,
			sortable: false,
			filter: false,
			minWidth: 200,
			flex: 1,
		},
	] as any

	return (
		<>
			<PageBreadcrumbsWithLinks title={t('Manage.Settings_Heading', 'Settings')} subNames={[{ label: t('Administrators_Heading', 'Administrators'), link: MenuLinks.ViewAdministratorSubMenu }, { label: t('Manage.Settings_Breadcrumb', 'Settings') }]} />
			<div>
				{loading && loadingIndicator()}
				{!loading && rowData && (
					<>
						<PageWrapper>
							<PageBody>
								<DataGridWithoutPagination rowData={rowData} columnDefs={columnDefs} />
							</PageBody>
						</PageWrapper>
					</>
				)}
			</div>
		</>
	)
}

export default ViewSettings
