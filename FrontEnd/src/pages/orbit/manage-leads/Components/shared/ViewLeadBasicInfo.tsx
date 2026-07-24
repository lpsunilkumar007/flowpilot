import { PopupBody, PopupFooter, PopupHeader, PopupWrapper } from '@/components'
import { formatHelper } from '@/helpers/format.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { leadService } from '@/services/LeadService'
import type { ViewLeadDetailResponse } from '@/types/crm/lead.types'
import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { getUserDisplayName, type LeadUserLookup } from '../../helpers/leadDisplay.helper'
import LeadStatusBadge from './LeadStatusBadge'

interface ViewLeadBasicInfoProps {
	leadId: number
	users: LeadUserLookup[]
	onClose: () => void
}

const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: ReactNode }) => (
	<div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3.5 dark:border-gray-700 dark:bg-gray-900/40">
		<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
			<i className={`${icon} text-base`} />
		</div>
		<div className="min-w-0 flex-1">
			<p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
			<div className="mt-1 break-words text-sm font-semibold text-gray-900 dark:text-gray-100">{value || '—'}</div>
		</div>
	</div>
)

const ViewLeadBasicInfo: React.FC<ViewLeadBasicInfoProps> = ({ leadId, users, onClose }) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(true)
	const [lead, setLead] = useState<ViewLeadDetailResponse | null>(null)

	useEffect(() => {
		let cancelled = false
		const load = async () => {
			setLoading(true)
			try {
				const res = await leadService.getById(leadId)
				if (!cancelled) setLead(res)
			} catch {
				if (!cancelled) setLead(null)
			} finally {
				if (!cancelled) setLoading(false)
			}
		}
		load()
		return () => {
			cancelled = true
		}
	}, [leadId])

	return (
		<PopupWrapper variant="compact" className="m-0 h-auto overflow-hidden rounded-lg">
			<PopupHeader
				title={
					<span className="inline-flex items-center gap-2">
						<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
							<i className="ri-user-star-line text-lg" />
						</span>
						{t('Manage.Leads.BasicInfo_Heading', 'Lead Basic Info')}
					</span>
				}
				onClose={onClose}
			/>
			<PopupBody className="!overflow-visible">
				{loading && <AnimationSkeleton />}
				{!loading && !lead && (
					<div className="flex flex-col items-center gap-2 py-10 text-center text-gray-500">
						<i className="ri-error-warning-line text-3xl text-gray-400" />
						<p className="text-sm">{t('Manage.Leads.BasicInfo_NotFound', 'Lead details could not be loaded.')}</p>
					</div>
				)}
				{!loading && lead && (
					<div className="space-y-4">
						<div className="flex items-start gap-3 rounded-xl border border-primary/10 bg-gradient-to-r from-primary/5 via-transparent to-transparent p-4 dark:from-primary/10">
							<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
								<i className="ri-building-2-line text-xl" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-xs font-medium text-gray-500">#{lead.id}</p>
								<h4 className="truncate text-lg font-semibold text-gray-900 dark:text-white">{lead.businessName}</h4>
								<div className="mt-2">
									<LeadStatusBadge statusName={lead.leadStatusName} />
								</div>
							</div>
						</div>

						<div className="grid gap-3 sm:grid-cols-2">
							<InfoRow icon="ri-user-star-line" label={t('Manage.Leads.LeadName', 'Lead Name')} value={lead.businessName} />
							<InfoRow icon="ri-building-line" label={t('Manage.Leads.BusinessName', 'Business Name')} value={lead.businessName} />
							<InfoRow icon="ri-user-line" label={t('Manage.Leads.ContactPerson', 'Contact Person')} value={lead.ownerName} />
							<InfoRow
								icon="ri-mail-line"
								label={t('Manage.Leads.Email', 'Email')}
								value={
									lead.email ? (
										<a href={`mailto:${lead.email}`} className="text-primary hover:underline">
											{lead.email}
										</a>
									) : (
										'—'
									)
								}
							/>
							<InfoRow
								icon="ri-phone-line"
								label={t('Manage.Leads.Phone', 'Phone')}
								value={
									lead.mobile ? (
										<a href={`tel:${lead.mobile}`} className="text-primary hover:underline">
											{lead.mobile}
										</a>
									) : (
										'—'
									)
								}
							/>
							<InfoRow icon="ri-user-line" label={t('Manage.Leads.AssignedTo', 'Assigned To')} value={getUserDisplayName(users, lead.assignedToUserId)} />
							<InfoRow icon="ri-megaphone-line" label={t('Manage.Leads.LeadSource', 'Lead Source')} value={lead.leadSource} />
							<InfoRow icon="ri-calendar-check-line" label={t('Manage.Leads.NextFollowUpDate', 'Next Follow-up Date')} value={lead.nextFollowUpDate ? formatHelper.MomentDateFormat(lead.nextFollowUpDate) : '—'} />
						</div>
					</div>
				)}
			</PopupBody>
			<PopupFooter>
				<button type="button" className="btn btn-secondary inline-flex items-center gap-2" onClick={onClose}>
					<i className="ri-close-line" />
					{t('Common.Close', 'Close')}
				</button>
			</PopupFooter>
		</PopupWrapper>
	)
}

export default ViewLeadBasicInfo
