import { FormInput } from '@/components'
import DeleteConfirmation from '@/components/DeleteConfirmation'
import Pagination from '@/components/Pagination'
import { PagingVariables } from '@/constants/paging'
import { PermissionTypes } from '@/constants/permissions'
import type { UserDropDownItemResponse } from '@/helpers/api/WebApiClient'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { messageHelper } from '@/helpers/message.helper'
import { usePermission } from '@/hooks/usePermission'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { offeringService } from '@/services/OfferingService'
import { OfferingStatus, OfferingType, type ViewOfferingResponse } from '@/types/crm/offering.types'
import { useCallback, useEffect, useMemo, useState, type FC } from 'react'
import { useTranslation } from 'react-i18next'
import { enumNumericValue, isOfferingActive } from '../helpers/offeringDisplay.helper'
import OfferingListCard from './OfferingListCard'

const CLIENT_FETCH_PAGE_SIZE = 10000

interface ViewOfferingsProps {
	reloadOfferings: boolean
	users: UserDropDownItemResponse[]
	onEdit: (offering: ViewOfferingResponse) => void
}

const ViewOfferings: FC<ViewOfferingsProps> = ({ reloadOfferings, users, onEdit }) => {
	const { t } = useTranslation()
	const { userHasPermission } = usePermission()
	const canUpdate = userHasPermission(PermissionTypes.Permissions_ManageOfferings_Update)
	const canDelete = userHasPermission(PermissionTypes.Permissions_ManageOfferings_Delete)
	const canCreateLead = userHasPermission(PermissionTypes.Permissions_ManageLeads_Create)
	const canViewLeads = userHasPermission(PermissionTypes.Permissions_ManageLeads_View)
	const canViewPipeline = userHasPermission(PermissionTypes.Permissions_ManageSalePipelines_View)

	const [loading, setLoading] = useState(true)
	const [allOfferings, setAllOfferings] = useState<ViewOfferingResponse[]>([])
	const [searchText, setSearchText] = useState('')
	const [typeFilter, setTypeFilter] = useState('')
	const [statusFilter, setStatusFilter] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [deleteTarget, setDeleteTarget] = useState<ViewOfferingResponse | null>(null)

	const fetchOfferings = useCallback(async () => {
		await runWithToast(
			async () => {
				const res = await offeringService.search({
					pageNumber: 1,
					pageSize: CLIENT_FETCH_PAGE_SIZE,
				})
				setAllOfferings(res.data ?? [])
				return res
			},
			{ setLoading }
		)
	}, [])

	useEffect(() => {
		fetchOfferings()
	}, [fetchOfferings, reloadOfferings])

	const userNameById = useMemo(() => {
		const map = new Map<string, string>()
		users.forEach((u) => {
			if (u.strValue) map.set(u.strValue, u.text ?? u.strValue)
		})
		return map
	}, [users])

	const filteredOfferings = useMemo(() => {
		const term = searchText.trim().toLowerCase()
		const typeValue = typeFilter !== '' ? enumNumericValue(OfferingType, typeFilter) : undefined
		const statusValue = statusFilter !== '' ? enumNumericValue(OfferingStatus, statusFilter) : undefined

		return allOfferings.filter((offering) => {
			if (typeValue !== undefined && enumNumericValue(OfferingType, offering.type) !== typeValue) return false
			if (statusValue !== undefined && enumNumericValue(OfferingStatus, offering.status) !== statusValue) return false
			if (!term) return true
			const name = offering.name?.toLowerCase() ?? ''
			const description = offering.description?.toLowerCase() ?? ''
			const id = String(offering.id)
			return name.includes(term) || description.includes(term) || id.includes(term)
		})
	}, [allOfferings, searchText, statusFilter, typeFilter])

	const pageSize = PagingVariables.DefaultPageSize
	const totalPages = Math.max(1, Math.ceil(filteredOfferings.length / pageSize))
	const safePage = Math.min(currentPage, totalPages)
	const pagedOfferings = useMemo(() => {
		const start = (safePage - 1) * pageSize
		return filteredOfferings.slice(start, start + pageSize)
	}, [filteredOfferings, pageSize, safePage])

	useEffect(() => {
		setCurrentPage(1)
	}, [searchText, typeFilter, statusFilter])

	const handleReset = () => {
		setSearchText('')
		setTypeFilter('')
		setStatusFilter('')
		setCurrentPage(1)
	}

	const handleStatusToggle = async (offering: ViewOfferingResponse) => {
		const nextStatus = isOfferingActive(offering.status) ? OfferingStatus.Inactive : OfferingStatus.Active
		await runWithToast(() => offeringService.updateStatus(offering.id, { status: nextStatus }), {
			onSuccess: (message) => {
				messageHelper.showSuccess(message)
				fetchOfferings()
			},
		})
	}

	const handleDelete = async () => {
		if (!deleteTarget) return
		await runWithToast(() => offeringService.delete(deleteTarget.id), {
			onSuccess: (message) => {
				messageHelper.showSuccess(message)
				setDeleteTarget(null)
				fetchOfferings()
			},
		})
	}

	return (
		<div className="space-y-5">
			<div className="grid gap-4 lg:grid-cols-[1fr_180px_180px_auto] lg:items-end">
				<FormInput label={t('Manage.Offerings.Filter_Search', 'Search offerings')} name="searchText" type="text" className="form-input" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder={t('Manage.Offerings.SearchPlaceholder', 'Name, description, offering ID...')} />
				<FormInput label={t('Manage.Offerings.Type', 'Type')} name="typeFilter" type="bottom-sheet" className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
					<option value="">{t('Common.All', 'All')}</option>
					<option value={OfferingType.Product}>{t('Manage.Offerings.Type_Product', 'Product')}</option>
					<option value={OfferingType.Project}>{t('Manage.Offerings.Type_Project', 'Project')}</option>
				</FormInput>
				<FormInput label={t('Manage.Offerings.Status', 'Status')} name="statusFilter" type="bottom-sheet" className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
					<option value="">{t('Common.All', 'All')}</option>
					<option value={OfferingStatus.Active}>{t('Common.Active', 'Active')}</option>
					<option value={OfferingStatus.Inactive}>{t('Common.Inactive', 'Inactive')}</option>
				</FormInput>
				<div className="flex gap-2">
					<button type="button" onClick={() => setCurrentPage(1)} className="btn btn-primary">
						{t('Common.Search', 'Search')}
					</button>
					<button type="button" onClick={handleReset} className="btn btn-secondary">
						{t('Common.Reset', 'Reset')}
					</button>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
					<p className="text-xs uppercase text-gray-500">{t('Manage.Offerings.Stat_Total', 'Total offerings')}</p>
					<p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-gray-100">{allOfferings.length}</p>
				</div>
			</div>

			{loading ? (
				<AnimationSkeleton />
			) : filteredOfferings.length === 0 ? (
				<div className="rounded-lg border border-dashed border-gray-200 p-10 text-center dark:border-gray-700">
					<i className="ri-shopping-bag-3-line text-4xl text-gray-300" />
					<p className="mt-3 text-lg font-medium text-gray-700 dark:text-gray-200">{t('Manage.Offerings.Empty_Title', 'No offerings found')}</p>
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{pagedOfferings.map((offering) => (
						<OfferingListCard
							key={offering.id}
							offering={offering}
							ownerName={userNameById.get(offering.ownerUserId) ?? offering.ownerUserId}
							canUpdate={canUpdate}
							canDelete={canDelete}
							canCreateLead={canCreateLead}
							canViewLeads={canViewLeads}
							canViewPipeline={canViewPipeline}
							onEdit={() => onEdit(offering)}
							onToggleStatus={() => handleStatusToggle(offering)}
							onDelete={() => setDeleteTarget(offering)}
						/>
					))}
				</div>
			)}

			{totalPages > 1 && (
				<Pagination
					currentPage={safePage}
					totalPages={totalPages}
					hasPreviousPage={safePage > 1}
					hasNextPage={safePage < totalPages}
					onPageChange={setCurrentPage}
				/>
			)}

			<DeleteConfirmation
				isOpen={Boolean(deleteTarget)}
				onClose={() => setDeleteTarget(null)}
				onConfirm={handleDelete}
				title={t('Manage.Offerings.Delete_Title', 'Delete Offering')}
				description={t('Manage.Offerings.Delete_Description', 'This offering will be archived and removed from active lists.')}
			/>
		</div>
	)
}

export default ViewOfferings
