import { campaignService } from '@/services/CampaignService'
import type { ViewCampaignLeadPickerResponse } from '@/types/crm/campaign.types'
import { useEffect, useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

const CampaignLeadPicker: React.FC = () => {
	const { t } = useTranslation()
	const { watch, setValue, formState } = useFormContext()
	const offeringId = Number(watch('offeringId'))
	const selectedIds: number[] = watch('leadIds') ?? []
	const [leads, setLeads] = useState<ViewCampaignLeadPickerResponse[]>([])
	const [loading, setLoading] = useState(false)
	const [searchText, setSearchText] = useState('')

	useEffect(() => {
		if (!offeringId) {
			setLeads([])
			setValue('leadIds', [])
			return
		}

		let cancelled = false
		setLoading(true)
		setValue('leadIds', [])
		campaignService
			.getLeadsByOffering(offeringId)
			.then((result) => {
				if (!cancelled) setLeads(result ?? [])
			})
			.catch(() => {
				if (!cancelled) setLeads([])
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})

		return () => {
			cancelled = true
		}
	}, [offeringId, setValue])

	const selectableLeads = useMemo(() => leads.filter((lead) => Boolean(lead.email?.trim())), [leads])
	const filteredLeads = useMemo(() => {
		const term = searchText.trim().toLowerCase()
		if (!term) return leads
		return leads.filter(
			(lead) =>
				lead.businessName?.toLowerCase().includes(term) ||
				lead.ownerName?.toLowerCase().includes(term) ||
				lead.email?.toLowerCase().includes(term) ||
				lead.mobile?.toLowerCase().includes(term)
		)
	}, [leads, searchText])

	const toggleLead = (lead: ViewCampaignLeadPickerResponse, checked: boolean) => {
		if (!lead.email?.trim()) return
		const next = checked ? [...selectedIds, lead.id] : selectedIds.filter((id) => id !== lead.id)
		setValue('leadIds', Array.from(new Set(next)), { shouldValidate: true })
	}

	const allSelectableVisible = filteredLeads.filter((lead) => Boolean(lead.email?.trim()))
	const allSelected = allSelectableVisible.length > 0 && allSelectableVisible.every((lead) => selectedIds.includes(lead.id))

	const toggleSelectAll = (checked: boolean) => {
		if (checked) {
			setValue('leadIds', Array.from(new Set([...selectedIds, ...allSelectableVisible.map((lead) => lead.id)])), { shouldValidate: true })
			return
		}

		const visibleIds = new Set(allSelectableVisible.map((lead) => lead.id))
		setValue(
			'leadIds',
			selectedIds.filter((id) => !visibleIds.has(id)),
			{ shouldValidate: true }
		)
	}

	if (!offeringId) {
		return <p className="text-sm text-gray-500">{t('Manage.Campaigns.SelectOfferingFirst', 'Select an offering to load related leads.')}</p>
	}

	if (loading) {
		return <p className="text-sm text-gray-500">{t('Common.Loading', 'Loading...')}</p>
	}

	if (leads.length === 0) {
		return <p className="text-sm text-gray-500">{t('Manage.Campaigns.NoLeadsForOffering', 'No leads found for this offering.')}</p>
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="text-sm text-gray-600 dark:text-gray-300">
					{t('Manage.Campaigns.SelectedCount', '{{count}} selected', { count: selectedIds.length })}
					{' · '}
					{t('Manage.Campaigns.SelectableCount', '{{count}} with assigned user email', { count: selectableLeads.length })}
				</p>
				<label className="inline-flex items-center gap-2 text-sm">
					<input type="checkbox" className="form-checkbox" checked={allSelected} onChange={(e) => toggleSelectAll(e.target.checked)} />
					{t('Manage.Campaigns.SelectAll', 'Select all with assigned user email')}
				</label>
			</div>
			<input
				className="form-input"
				value={searchText}
				onChange={(e) => setSearchText(e.target.value)}
				placeholder={t('Manage.Campaigns.LeadSearchPlaceholder', 'Search business, assigned user, email, phone...')}
			/>
			<div className="max-h-80 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
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
						{filteredLeads.map((lead) => {
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
			{formState.errors.leadIds?.message && <p className="text-sm text-red-600">{String(formState.errors.leadIds.message)}</p>}
		</div>
	)
}

export default CampaignLeadPicker
