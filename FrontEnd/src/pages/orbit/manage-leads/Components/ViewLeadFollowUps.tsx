import { formatHelper } from '@/helpers/format.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { leadService } from '@/services/LeadService'
import { FollowUpStatus, FollowUpType, type ViewLeadFollowUpResponse } from '@/types/crm/lead.types'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { leadCardClass } from '../helpers/leadDisplay.helper'
import LeadSectionCard from './shared/LeadSectionCard'

interface ViewLeadFollowUpsProps {
	id: string
}

const statusTone: Record<string, string> = {
	Pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
	Completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
	Missed: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
	Cancelled: 'bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300',
}

const ViewLeadFollowUps: React.FC<ViewLeadFollowUpsProps> = ({ id }) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(true)
	const [followUps, setFollowUps] = useState<ViewLeadFollowUpResponse[]>([])

	useEffect(() => {
		const load = async () => {
			setLoading(true)
			try {
				const lead = await leadService.getById(Number(id))
				setFollowUps(lead.followUps ?? [])
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [id])

	if (loading) return <AnimationSkeleton />

	const formatFollowUpStatus = (status: FollowUpStatus | string) => {
		if (typeof status === 'string') return formatHelper.punctuateLabel(status)
		return formatHelper.punctuateLabel(FollowUpStatus[status])
	}

	const formatFollowUpType = (type: FollowUpType | string) => {
		if (typeof type === 'string') return formatHelper.punctuateLabel(type)
		return formatHelper.punctuateLabel(FollowUpType[type])
	}

	return (
		<div className="p-4">
			<LeadSectionCard title={t('Manage.Leads.FollowUps', 'Follow-ups')} subtitle={t('Manage.Leads.FollowUps_Sub', 'Scheduled touchpoints')} icon="ri-calendar-check-line">
				{followUps.length === 0 ? (
					<div className="py-8 text-center text-gray-500">
						<i className="ri-calendar-line text-3xl" />
						<p className="mt-2">{t('Manage.Leads.NoFollowUps', 'No follow-ups scheduled.')}</p>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2">
						{followUps.map((f) => {
							const statusKey = typeof f.followUpStatus === 'string' ? f.followUpStatus : FollowUpStatus[f.followUpStatus]
							return (
								<div key={f.id} className={`${leadCardClass} p-4`}>
									<div className="flex items-start justify-between gap-2">
										<div>
											<p className="text-sm text-gray-500">{formatFollowUpType(f.followUpType)}</p>
											<p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{formatHelper.MomentDateFormat(f.nextFollowUpDate)}</p>
										</div>
										<span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone[statusKey] ?? statusTone.Pending}`}>{formatFollowUpStatus(f.followUpStatus)}</span>
									</div>
									{f.reminderNote && <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{f.reminderNote}</p>}
								</div>
							)
						})}
					</div>
				)}
			</LeadSectionCard>
		</div>
	)
}

export default ViewLeadFollowUps
