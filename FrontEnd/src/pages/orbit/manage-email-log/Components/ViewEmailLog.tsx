import { FormInput, Label } from '@/components'
import DataGridWithPagination from '@/components/DataGrid/DataGridWithPagination'
import { renderCopyCell } from '@/components/grid.helper'
import { PageFilter, PageFilterActions, PageFilterFields } from '@/components/PageFilter'
import { PagingVariables } from '@/constants/paging'
import { PaginationResponseOfViewEmailLogResponse, SearchEmailLogRequest } from '@/helpers/api/WebApiClient'
import { gridHelper, GridSortingDetails } from '@/helpers/grid.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { emailLogService } from '@/services/EmailLogService'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ViewEmailLogActionButtons from './ViewEmailLogActionButtons'
interface ViewEmailLogCodesProps {
	onActionClick: (id: number, action: string) => void
}
type ModalState = {
	filterStatus: string
	toSearchText?: string
	fromSearchText?: string
	subjectSearchText?: string
}

const ViewEmailLog: React.FC<ViewEmailLogCodesProps> = (props) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(true)
	const [rowData, setRowData] = useState<PaginationResponseOfViewEmailLogResponse>()
	const [gridSortingDetails, setGridSortingDetails] = useState<GridSortingDetails>({ sortField: 'createdOn', sortOrder: 'desc' })

	const [modalState, setModalState] = useState<ModalState>({
		filterStatus: 'All',
		toSearchText: undefined,
		fromSearchText: undefined,
		subjectSearchText: undefined,
	})
	const loadingIndicator = () => <AnimationSkeleton />

	const fetchEmailLog = async (pageNumber: number, isReset: boolean) => {
		try {
			const searchModel = new SearchEmailLogRequest()
			searchModel.pageNumber = pageNumber
			searchModel.sortOrder = gridSortingDetails.sortOrder
			searchModel.sortField = gridSortingDetails.sortField

			searchModel.to = isReset ? undefined : modalState.toSearchText
			searchModel.from = isReset ? undefined : modalState.fromSearchText
			searchModel.subject = isReset ? undefined : modalState.subjectSearchText
			if (isReset || modalState.filterStatus === 'All') {
				searchModel.sentStatus = undefined
			} else {
				searchModel.sentStatus = modalState.filterStatus === 'true'
			}

			searchModel.pageSize = PagingVariables.DefaultPageSize
			const response = await emailLogService.getEmailLogList(searchModel)
			setRowData(response)
		} finally {
			setLoading(false)
		}
	}

	const [columnDefs] = useState([
		{ field: 'from', headerName: t('Manage.EmailLog.Grid_From', 'From') },
		{ field: 'to', headerName: t('Manage.EmailLog.Grid_To', 'To') },
		{
			field: 'subject',
			headerName: t('Manage.EmailLog.Grid_Subject', 'Subject'),
			tooltipField: 'subject',
			cellClass: 'truncate',
			cellRenderer: (params: any) => {
				return renderCopyCell(params)
			},
		},
		{
			field: 'createdOn',
			sortingOrder: ['asc', 'desc'],
			sort: 'desc',
			headerName: t('Manage.EmailLog.Grid_DateTime', 'Date & Time'),
			comparator: gridHelper.sortingComparator,
			cellRenderer: (param: any) => {
				return param.data.createdOn ? moment(param.data.createdOn).format('DD-MMM-YYYY HH:mm:ss a') : ''
			},
		},
		{
			field: 'isEmailSent',
			headerName: t('Manage.EmailLog.Grid_SentStatus', 'Sent Status'),
			cellRenderer: (params: any) => {
				const isEmailSent: boolean = params.value
				return (
					<div>
						<span className={`ml-2 ${isEmailSent ? 'orbit-pill orbit-pill--success' : 'orbit-pill orbit-pill--danger'}`}>{isEmailSent ? 'Yes' : 'No'}</span>
					</div>
				)
			},
		},
		{
			field: 'id',
			sortable: false,
			headerName: t('Manage.EmailLog.Grid_Actions', 'Actions'),
			cellClass: 'actions',
			minWidth: 250,
			flex: 1,
			cellRenderer: (params: any) => <ViewEmailLogActionButtons onActionClick={(id, number) => props.onActionClick(id, number)} id={params.data.id} />,
		},
	] as any)

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
		if (id === 'isEmailSent') {
			assignValueToModalState('filterStatus', filterValue)
		}
	}
	const resetForm = async () => {
		assignValueToModalState('filterStatus', 'All')
		assignValueToModalState('toSearchText', undefined)
		assignValueToModalState('fromSearchText', undefined)
		assignValueToModalState('subjectSearchText', undefined)
		await fetchEmailLog(0, true)
	}
	useEffect(() => {
		const fetchData = async () => {
			await fetchEmailLog(0, false)
		}
		fetchData()
	}, [gridSortingDetails])

	return (
		<>
			<PageFilter>
				<PageFilterFields className="grid gap-4 lg:grid-cols-2">
					<FormInput label={t('Manage.EmailLog.Grid.Search_From', 'Email From')} value={modalState.fromSearchText ?? ''} name="from" id="from" onChange={(e) => assignValueToModalState('fromSearchText', e.target.value)} className="form-input border" labelClassName="form-label" />

					<FormInput label={t('Manage.EmailLog.Grid.Search_To', 'Email To')} value={modalState.toSearchText ?? ''} name="to" id="to" onChange={(e) => assignValueToModalState('toSearchText', e.target.value)} className="form-input border" labelClassName="form-label" />

					<FormInput label={t('Manage.EmailLog.Grid.Search_Subject', 'Subject')} value={modalState.subjectSearchText ?? ''} name="subject" id="subject" onChange={(e) => assignValueToModalState('subjectSearchText', e.target.value)} className="form-input border" labelClassName="form-label" />

					<div>
						<Label variant="search">{t('Manage.EmailLog.Grid.Search_BySentEmail', 'Sent Email')}</Label>
						<FormInput id="isEmailSent" value={modalState.filterStatus} onChange={(e) => handleFilterChange(e)} type="bottom-sheet" className="form-select" name={'isEmailSent'}>
							<option value="All">{t('Manage.EmailLog.Grid.SearchDD_All', 'All')}</option>
							<option value="true">{t('Manage.EmailLog.Grid.SearchDD_Yes', 'Yes')}</option>
							<option value="false">{t('Manage.EmailLog.Grid.SearchDD_No', 'No')}</option>
						</FormInput>
					</div>
				</PageFilterFields>

				<PageFilterActions>
					<button onClick={() => fetchEmailLog(0, false)} className="btn btn-primary">
						{t('Manage.EmailLog.Grid_Search', 'Search')}
					</button>

					<button onClick={resetForm} className="btn btn-secondary">
						{t('Manage.EmailLog.Grid_Reset', 'Reset')}
					</button>
				</PageFilterActions>
			</PageFilter>
			{loading && loadingIndicator()}
			{!loading && rowData && (
				<DataGridWithPagination
					rowData={rowData}
					columnDefs={columnDefs}
					onSortChanged={(event) => {
						setGridSortingDetails(gridHelper.handleSortChanged(event))
					}}
					onPageChange={async (page) => {
						await fetchEmailLog(page, false)
					}}
				/>
			)}
		</>
	)
}

export default ViewEmailLog
