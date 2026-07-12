import { FormInput, Label } from '@/components'
import DataGridWithPagination from '@/components/DataGrid/DataGridWithPagination'
import { PagingVariables } from '@/constants/paging'
import { PaginationResponseOfViewTenantResponse, SearchTenantRequest } from '@/helpers/api/WebApiClient'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { formatHelper } from '@/helpers/format.helper'
import { gridHelper } from '@/helpers/grid.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { multiTenantService } from '@/services/MultiTenantService'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ViewTenantActionButtons from './ViewTenantActionButtons'
import { PageFilter, PageFilterActions, PageFilterFields } from '@/components/PageFilter'

interface ViewTenantsProps {
	onActionClick: (id: string, action: string) => void
}

type ModalState = {
	filterStatus: string
	searchText?: string
}

const ViewTenants: React.FC<ViewTenantsProps> = (props) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(true)
	const [rowData, setRowData] = useState<PaginationResponseOfViewTenantResponse>()
	const [modalState, setModalState] = useState<ModalState>({
		filterStatus: 'All',
		searchText: undefined,
	})

	const [columnDefs] = useState([
		{
			field: 'name',
			headerName: t('Manage.Tenants.Grid_TenantsName', 'Tenant Name'),
			sort: 'asc',
			sortingOrder: ['asc', 'desc'],
			comparator: gridHelper.sortingComparator,
			minWidth: 200,
		},
		{
			field: 'adminEmail',
			headerName: t('Manage.Tenants.Grid_AdminEmail', 'Admin Email'),
			minWidth: 200,
		},
		{
			field: 'stripeCustomerId',
			headerName: t('Manage.Tenants.Grid_StripeCustomerId', 'Stripe Customer ID'),
			minWidth: 200,
			valueFormatter: (p: any) => p.value ?? '-',
		},
		{
			field: 'createdOn',
			headerName: t('Manage.Tenants.Grid_CreateOn', 'Created On'),
			minWidth: 200,
			cellRenderer: (params: any) => formatHelper.MomentDateFormat(params.value),
		},
		{
			field: 'isActive',
			headerName: t('Manage.Tenants.Grid_Status', 'Status'),
			minWidth: 150,
			cellRenderer: (params: any) => <span className={params.value ? 'orbit-pill orbit-pill--success' : 'orbit-pill orbit-pill--danger'}>{params.value ? 'Active' : 'Inactive'}</span>,
		},

		{
			field: 'id',
			sortable: false,
			headerName: t('Manage.Tenants.Grid.Actions_Actions', 'Actions'),
			cellClass: 'actions',
			minWidth: 250,
			flex: 1,
			cellRenderer: (params: any) => <ViewTenantActionButtons id={params.data.id} onActionClick={props.onActionClick} />,
		},
	] as any)

	const fetchTenants = async (pageNumber: number, isReset: boolean) => {
		const searchModel = new SearchTenantRequest()
		searchModel.pageNumber = pageNumber
		searchModel.pageSize = PagingVariables.DefaultPageSize
		searchModel.freeText = isReset ? undefined : modalState.searchText

		if (isReset || modalState.filterStatus === 'All') {
			searchModel.isActive = undefined
		} else {
			searchModel.isActive = modalState.filterStatus === 'true'
		}
		await runWithToast(
			async () => {
				const res = await multiTenantService.getTenant(searchModel)
				setRowData(res)
				return res
			},
			{ setLoading }
		)
	}

	const assignValueToModalState = (modalName: keyof ModalState, value: any) => {
		setModalState((prev) => ({
			...prev,
			[modalName]: value,
		}))
	}

	const handleFilterChange = async (event: any) => {
		const { filterValue, id } = {
			filterValue: event.target.value,
			id: event.target.id,
		}
		if (id === 'isActive') {
			assignValueToModalState('filterStatus', filterValue)
		}
	}

	const resetForm = async () => {
		assignValueToModalState('filterStatus', 'All')
		assignValueToModalState('searchText', undefined)
		await fetchTenants(0, true)
	}

	useEffect(() => {
		fetchTenants(0, false)
	}, [])

	return (
		<>
			<PageFilter>
				<PageFilterFields className="grid lg:grid-cols-2 gap-6">
					<FormInput label={t('Manage.Tenants.Grid.Search_Tenants', 'Tenants')} value={modalState.searchText ?? ''} type="text" name="freeText" id="freeText" labelClassName="form-label" key="freeText" containerClass="form-field" onChange={(e) => assignValueToModalState('searchText', e.target.value)} className="form-input border" />
					<div>
						<Label variant="search">{t('Manage.Tenants.Grid.Search_Status', 'Status')}</Label>
						<FormInput id="isActive" name="isActive" key="isActive" value={modalState.filterStatus} onChange={(e) => handleFilterChange(e)} className="form-select" type="bottom-sheet">
							<option key="All" value="All">
								{t('Manage.Tenants.Grid.Search_All', 'All')}
							</option>
							<option key="true" value="true">
								{t('Manage.Tenants.Grid.Search_Active', 'Active')}
							</option>
							<option key="false" value="false">
								{t('Manage.Tenants.Grid.Search_Inactive', 'Inactive')}
							</option>
						</FormInput>
					</div>
				</PageFilterFields>

				<PageFilterActions>
					<button onClick={() => fetchTenants(0, false)} className="btn btn-primary">
						{t('Manage.Tenants.Grid.Search_Btn', 'Search')}
					</button>
					<button onClick={resetForm} className="btn btn-secondary">
						{t('Manage.Tenants.Grid.Reset_Btn', 'Reset')}
					</button>
				</PageFilterActions>
			</PageFilter>

			{loading && <AnimationSkeleton />}
			{!loading && rowData && (
				<DataGridWithPagination
					rowData={rowData}
					columnDefs={columnDefs}
					onPageChange={async (page) => {
						await fetchTenants(page, false)
					}}
				/>
			)}
		</>
	)
}

export default ViewTenants
