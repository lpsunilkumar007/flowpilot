import type { UserDropDownItemResponse } from '@/helpers/api/WebApiClient'
import { formatHelper } from '@/helpers/format.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { DropDownService } from '@/services/DropDownService'
import type { ViewLeadDetailResponse } from '@/types/crm/lead.types'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getUserDisplayName, leadCardClass } from '../helpers/leadDisplay.helper'
import LeadSectionCard from './shared/LeadSectionCard'
import LeadStatusBadge from './shared/LeadStatusBadge'

interface ViewLeadHistoryProps {
	lead: ViewLeadDetailResponse
}

const ViewLeadHistory: React.FC<ViewLeadHistoryProps> = ({ lead }) => {
	const { t } = useTranslation()
	const [users, setUsers] = useState<UserDropDownItemResponse[]>([])
	const [loadingUsers, setLoadingUsers] = useState(true)
	const statusHistories = lead.statusHistories ?? []
	const assignmentHistories = lead.assignmentHistories ?? []

	useEffect(() => {
		const load = async () => {
			setLoadingUsers(true)
			try {
				const userList = await DropDownService.getSystemUsers(true)
				setUsers(userList ?? [])
			} finally {
				setLoadingUsers(false)
			}
		}
		load()
	}, [])

	if (loadingUsers) return <AnimationSkeleton />

	return (
		<div className="space-y-6 p-4">
			<LeadSectionCard title={t('Manage.Leads.StatusHistory', 'Status history')} icon="ri-exchange-line">
				{statusHistories.length === 0 ? (
					<p className="text-gray-500">{t('Manage.Leads.NoStatusHistory', 'No status changes yet.')}</p>
				) : (
					<div className="space-y-3">
						{statusHistories.map((h) => (
							<div key={h.id} className={`${leadCardClass} flex flex-wrap items-center justify-between gap-3 p-4`}>
								<div className="flex flex-wrap items-center gap-2">
									{h.fromStatusName ? <LeadStatusBadge statusName={h.fromStatusName} /> : <span className="text-sm text-gray-400">Start</span>}
									<i className="ri-arrow-right-line text-gray-400" />
									<LeadStatusBadge statusName={h.toStatusName} />
								</div>
								<div className="text-right text-sm text-gray-500">
									<p>{formatHelper.MomentDateFormat(h.changedOn)}</p>
									{h.remarks && <p className="mt-1 text-gray-600 dark:text-gray-400">{h.remarks}</p>}
								</div>
							</div>
						))}
					</div>
				)}
			</LeadSectionCard>

			<LeadSectionCard title={t('Manage.Leads.AssignmentHistory', 'Assignment history')} icon="ri-user-shared-line">
				{assignmentHistories.length === 0 ? (
					<p className="text-gray-500">{t('Manage.Leads.NoAssignmentHistory', 'No assignment changes yet.')}</p>
				) : (
					<div className="space-y-3">
						{assignmentHistories.map((h) => (
							<div key={h.id} className={`${leadCardClass} p-4`}>
								<div className="flex flex-wrap items-center gap-2 text-sm">
									<span className="font-medium text-gray-800 dark:text-gray-200">{getUserDisplayName(users, h.fromUserId)}</span>
									<i className="ri-arrow-right-line text-gray-400" />
									<span className="font-medium text-primary">{getUserDisplayName(users, h.toUserId)}</span>
								</div>
								<p className="mt-2 text-xs text-gray-500">{formatHelper.MomentDateFormat(h.assignedOn)}</p>
								{h.remarks && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{h.remarks}</p>}
							</div>
						))}
					</div>
				)}
			</LeadSectionCard>
		</div>
	)
}

export default ViewLeadHistory
