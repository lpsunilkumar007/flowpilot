import { FormInput } from '@/components'
import Pagination from '@/components/Pagination'
import { PagingVariables } from '@/constants/paging'
import { PermissionTypes } from '@/constants/permissions'
import type { UserDropDownItemResponse, ViewUserDetailsResponse } from '@/helpers/api/WebApiClient'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { usePermission } from '@/hooks/usePermission'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { RootState } from '@/redux/store'
import { DropDownService } from '@/services/DropDownService'
import { leadService } from '@/services/LeadService'
import { LeadFilterType, type PaginationResponseOfViewLeadListResponse } from '@/types/crm/lead.types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { leadCardClass } from '../helpers/leadDisplay.helper'
import LeadFilterChips, { type LeadFilterOption } from './shared/LeadFilterChips'
import LeadListCard from './shared/LeadListCard'
import LeadStatCard from './shared/LeadStatCard'

interface ViewLeadsProps {
	reloadLeads: boolean
	onReload: () => void
}

const FILTER_OPTIONS: LeadFilterOption[] = [
	{ value: LeadFilterType.All, label: 'All Leads' },
	{ value: LeadFilterType.MyLeads, label: 'My Leads' },
	{ value: LeadFilterType.TodayFollowUps, label: "Today's Follow-ups" },
	{ value: LeadFilterType.Overdue, label: 'Overdue' },
	{ value: LeadFilterType.Interested, label: 'Interested' },
	{ value: LeadFilterType.Won, label: 'Won' },
	{ value: LeadFilterType.Lost, label: 'Lost' },
	{ value: LeadFilterType.Archived, label: 'Archived' },
]

const ViewLeads: React.FC<ViewLeadsProps> = ({ reloadLeads }) => {
	const { t } = useTranslation()
	const { userHasPermission } = usePermission()
	const canFilterByAssignee = userHasPermission(PermissionTypes.Permissions_Users_View)
	const userData = useSelector((state: RootState) => state.Auth.userData) as ViewUserDetailsResponse | undefined
	const currentUserId = userData?.id

	const [loading, setLoading] = useState(true)
	const [rowData, setRowData] = useState<PaginationResponseOfViewLeadListResponse>()
	const [users, setUsers] = useState<UserDropDownItemResponse[]>([])
	const [filterType, setFilterType] = useState(LeadFilterType.All)
	const [searchText, setSearchText] = useState('')
	const [assignedToUserId, setAssignedToUserId] = useState<string | undefined>()

	const usersForDisplay = useMemo(() => {
		if (canFilterByAssignee) return users
		if (!currentUserId) return []
		const name = `${userData?.firstName ?? ''} ${userData?.lastName ?? ''}`.trim() || userData?.email || currentUserId
		return [{ strValue: currentUserId, text: name }]
	}, [canFilterByAssignee, users, currentUserId, userData?.firstName, userData?.lastName, userData?.email])

	useEffect(() => {
		if (!canFilterByAssignee) return
		DropDownService.getSystemUsers(true)
			.then((list) => setUsers(list ?? []))
			.catch(() => setUsers([]))
	}, [canFilterByAssignee])

	const fetchLeads = useCallback(
		async (pageNumber: number, overrides?: { filterType?: LeadFilterType; searchText?: string; assignedToUserId?: string }) => {
			const assigneeFilter = canFilterByAssignee ? (overrides?.assignedToUserId ?? assignedToUserId) : undefined
			const searchModel = {
				pageNumber,
				pageSize: PagingVariables.DefaultPageSize,
				filterType: overrides?.filterType ?? filterType,
				searchText: overrides?.searchText ?? (searchText || undefined),
				...(assigneeFilter ? { assignedToUserId: assigneeFilter } : {}),
			}

			await runWithToast(
				async () => {
					const res = await leadService.search(searchModel)
					setRowData(res)
					return res
				},
				{ setLoading }
			)
		},
		[filterType, searchText, assignedToUserId, canFilterByAssignee]
	)

	useEffect(() => {
		fetchLeads(0)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [reloadLeads])

	const handleFilterChange = (value: LeadFilterType) => {
		setFilterType(value)
		fetchLeads(0, { filterType: value })
	}

	const handleSearch = () => fetchLeads(0)

	const handleReset = () => {
		setFilterType(LeadFilterType.All)
		setSearchText('')
		setAssignedToUserId(undefined)
		fetchLeads(0, { filterType: LeadFilterType.All, searchText: '', assignedToUserId: undefined })
	}

	if (loading && !rowData) return <AnimationSkeleton />

	const leads = rowData?.data ?? []

	return (
		<div className="space-y-6">
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<LeadStatCard label={t('Manage.Leads.Stat_Total', 'Total leads')} value={rowData?.totalCount ?? 0} icon="ri-group-line" />
				<LeadStatCard label={t('Manage.Leads.Stat_Page', 'On this page')} value={leads.length} icon="ri-layout-grid-line" accent="primary" />
				<LeadStatCard label={t('Manage.Leads.Stat_Filter', 'Active filter')} value={FILTER_OPTIONS.find((f) => f.value === filterType)?.label ?? 'All'} icon="ri-filter-3-line" accent="warning" />
				<LeadStatCard label={t('Manage.Leads.Stat_Pages', 'Pages')} value={rowData?.totalPages ?? 1} icon="ri-file-list-3-line" accent="success" />
			</div>

			<div className={`${leadCardClass} space-y-5 p-5`}>
				<div>
					<p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">{t('Manage.Leads.QuickFilters', 'Quick filters')}</p>
					<LeadFilterChips options={FILTER_OPTIONS} active={filterType} onChange={handleFilterChange} />
				</div>

				<div className={`grid gap-4 lg:items-end ${canFilterByAssignee ? 'lg:grid-cols-[1fr_auto_auto]' : 'lg:grid-cols-[1fr_auto]'}`}>
					<FormInput
						label={t('Manage.Leads.Filter_Search', 'Search leads')}
						name="searchText"
						type="text"
						className="form-input"
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						placeholder={t('Manage.Leads.SearchPlaceholder', 'Business, owner, phone, email, GST, lead ID...')}
					/>
					{canFilterByAssignee && (
						<FormInput label={t('Manage.Leads.Filter_AssignedTo', 'Assigned to')} name="assignedToUserId" type="bottom-sheet" className="form-select" value={assignedToUserId ?? ''} onChange={(e) => setAssignedToUserId(e.target.value || undefined)}>
							<option value="">{t('Common.All', 'All')}</option>
							{users.map((u) => (
								<option key={u.strValue} value={u.strValue}>
									{u.text}
								</option>
							))}
						</FormInput>
					)}
					<div className="flex gap-2">
						<button type="button" onClick={handleSearch} className="btn btn-primary">
							{t('Common.Search', 'Search')}
						</button>
						<button type="button" onClick={handleReset} className="btn btn-secondary">
							{t('Common.Reset', 'Reset')}
						</button>
					</div>
				</div>
			</div>

			{loading && <AnimationSkeleton />}

			{!loading && leads.length === 0 && (
				<div className={`${leadCardClass} p-10 text-center`}>
					<i className="ri-user-search-line text-4xl text-gray-300" />
					<p className="mt-3 text-lg font-medium text-gray-700 dark:text-gray-200">{t('Manage.Leads.Empty_Title', 'No leads found')}</p>
					<p className="mt-1 text-sm text-gray-500">{t('Manage.Leads.Empty_Subtitle', 'Try changing filters or create a new lead.')}</p>
				</div>
			)}

			{!loading && leads.length > 0 && (
				<>
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{leads.map((lead) => (
							<LeadListCard key={lead.id} lead={lead} users={usersForDisplay} />
						))}
					</div>
					{rowData && (
						<Pagination
							currentPage={rowData.currentPage}
							totalPages={rowData.totalPages}
							hasPreviousPage={rowData.hasPreviousPage}
							hasNextPage={rowData.hasNextPage}
							onPageChange={(page) => fetchLeads(page)}
						/>
					)}
				</>
			)}
		</div>
	)
}

export default ViewLeads
