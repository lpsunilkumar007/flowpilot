import Pagination from '@/components/Pagination'
import { campaignService } from '@/services/CampaignService'
import type { ViewCampaignLeadPickerResponse } from '@/types/crm/campaign.types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

const PAGE_SIZE = 10

const CampaignLeadPicker: React.FC = () => {
	const { t } = useTranslation()
	const { watch, setValue, formState } = useFormContext()
	const offeringId = Number(watch('offeringId'))
	const selectedIds: number[] = watch('leadIds') ?? []
	const [leads, setLeads] = useState<ViewCampaignLeadPickerResponse[]>([])
	const [loading, setLoading] = useState(false)
	const [searchText, setSearchText] = useState('')
	const searchTextRef = useRef(searchText)
	searchTextRef.current = searchText
	const [currentPage, setCurrentPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const [totalCount, setTotalCount] = useState(0)
	const [hasPreviousPage, setHasPreviousPage] = useState(false)
	const [hasNextPage, setHasNextPage] = useState(false)
	const requestIdRef = useRef(0)

	const fetchLeads = useCallback(
		async (pageNumber: number, overrides?: { searchText?: string }) => {
			if (!offeringId) return

			const nextSearchText =
				overrides && Object.prototype.hasOwnProperty.call(overrides, 'searchText') ? overrides.searchText || undefined : searchTextRef.current || undefined

			const requestId = ++requestIdRef.current
			setLoading(true)
			try {
				const result = await campaignService.getLeadsByOffering(offeringId, {
					pageNumber,
					pageSize: PAGE_SIZE,
					searchText: nextSearchText,
				})
				if (requestId !== requestIdRef.current) return
				setLeads(result.data ?? [])
				setCurrentPage(result.currentPage)
				setTotalPages(result.totalPages)
				setTotalCount(result.totalCount)
				setHasPreviousPage(result.hasPreviousPage)
				setHasNextPage(result.hasNextPage)
			} catch {
				if (requestId !== requestIdRef.current) return
				setLeads([])
				setCurrentPage(1)
				setTotalPages(1)
				setTotalCount(0)
				setHasPreviousPage(false)
				setHasNextPage(false)
			} finally {
				if (requestId === requestIdRef.current) setLoading(false)
			}
		},
		[offeringId]
	)

	useEffect(() => {
		if (!offeringId) {
			setLeads([])
			setSearchText('')
			setCurrentPage(1)
			setTotalPages(1)
			setTotalCount(0)
			setHasPreviousPage(false)
			setHasNextPage(false)
			setValue('leadIds', [])
			return
		}

		setSearchText('')
		setValue('leadIds', [])
		fetchLeads(1, { searchText: '' })
	}, [offeringId, fetchLeads, setValue])

	const selectableLeads = useMemo(() => leads.filter((lead) => Boolean(lead.email?.trim())), [leads])

	const toggleLead = (lead: ViewCampaignLeadPickerResponse, checked: boolean) => {
		if (!lead.email?.trim()) return
		const next = checked ? [...selectedIds, lead.id] : selectedIds.filter((id) => id !== lead.id)
		setValue('leadIds', Array.from(new Set(next)), { shouldValidate: true })
	}

	const allSelected = selectableLeads.length > 0 && selectableLeads.every((lead) => selectedIds.includes(lead.id))

	const toggleSelectAll = (checked: boolean) => {
		if (checked) {
			setValue('leadIds', Array.from(new Set([...selectedIds, ...selectableLeads.map((lead) => lead.id)])), { shouldValidate: true })
			return
		}

		const visibleIds = new Set(selectableLeads.map((lead) => lead.id))
		setValue(
			'leadIds',
			selectedIds.filter((id) => !visibleIds.has(id)),
			{ shouldValidate: true }
		)
	}

	if (!offeringId) {
		return <p className="text-sm text-gray-500">{t('Manage.Campaigns.SelectOfferingFirst', 'Select an offering to load related leads.')}</p>
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="text-sm text-gray-600 dark:text-gray-300">
					{t('Manage.Campaigns.SelectedCount', '{{count}} selected', { count: selectedIds.length })}
					{' · '}
					{t('Manage.Campaigns.PageSelectableCount', '{{count}} with assigned user email on this page', { count: selectableLeads.length })}
					{' · '}
					{t('Manage.Campaigns.LeadTotalCount', '{{count}} leads', { count: totalCount })}
				</p>
				<label className="inline-flex items-center gap-2 text-sm">
					<input type="checkbox" className="form-checkbox" checked={allSelected} onChange={(e) => toggleSelectAll(e.target.checked)} />
					{t('Manage.Campaigns.SelectAllPage', 'Select all on this page with assigned user email')}
				</label>
			</div>
			<div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
				<input
					className="form-input"
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault()
							fetchLeads(1)
						}
					}}
					placeholder={t('Manage.Campaigns.LeadSearchPlaceholder', 'Search business, contact, email, phone...')}
				/>
				<div className="flex gap-2">
					<button type="button" className="btn btn-primary" onClick={() => fetchLeads(1)}>
						{t('Common.Search', 'Search')}
					</button>
					<button
						type="button"
						className="btn btn-secondary"
						onClick={() => {
							setSearchText('')
							fetchLeads(1, { searchText: '' })
						}}
					>
						{t('Common.Reset', 'Reset')}
					</button>
				</div>
			</div>
			{loading && leads.length === 0 ? (
				<p className="text-sm text-gray-500">{t('Common.Loading', 'Loading...')}</p>
			) : leads.length === 0 ? (
				<p className="text-sm text-gray-500">
					{searchText.trim()
						? t('Manage.Campaigns.NoMatchingLeads', 'No matching leads found.')
						: t('Manage.Campaigns.NoLeadsForOffering', 'No leads found for this offering.')}
				</p>
			) : (
				<div className={`max-h-80 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 ${loading ? 'opacity-60' : ''}`}>
					<table className="w-full text-left text-sm">
						<thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-400">
							<tr>
								<th className="w-10 px-3 py-2" />
								<th className="px-3 py-2">{t('Manage.Campaigns.Lead_Business', 'Business')}</th>
								<th className="px-3 py-2">{t('Manage.Campaigns.Lead_Owner', 'Assigned To')}</th>
								<th className="px-3 py-2">{t('Manage.Campaigns.Lead_Email', 'Assigned email')}</th>
								<th className="px-3 py-2">{t('Manage.Campaigns.Lead_Mobile', 'Phone')}</th>
							</tr>
						</thead>
						<tbody>
							{leads.map((lead) => {
								const hasEmail = Boolean(lead.email?.trim())
								const checked = selectedIds.includes(lead.id)
								return (
									<tr key={lead.id} className={`border-t border-gray-100 dark:border-gray-700 ${hasEmail ? '' : 'opacity-60'}`}>
										<td className="px-3 py-2">
											<input type="checkbox" className="form-checkbox" disabled={!hasEmail} checked={checked} onChange={(e) => toggleLead(lead, e.target.checked)} />
										</td>
										<td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-100">{lead.businessName}</td>
										<td className="px-3 py-2 text-gray-600 dark:text-gray-300">{lead.ownerName}</td>
										<td className="px-3 py-2 text-gray-600 dark:text-gray-300">
											{hasEmail ? lead.email : t('Manage.Campaigns.NoEmail', 'No assigned user email')}
										</td>
										<td className="px-3 py-2 text-gray-600 dark:text-gray-300">{lead.mobile}</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				</div>
			)}
			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				hasPreviousPage={hasPreviousPage}
				hasNextPage={hasNextPage}
				onPageChange={(page) => fetchLeads(page)}
			/>
			{formState.errors.leadIds?.message && <p className="text-sm text-red-600">{String(formState.errors.leadIds.message)}</p>}
		</div>
	)
}

export default CampaignLeadPicker
