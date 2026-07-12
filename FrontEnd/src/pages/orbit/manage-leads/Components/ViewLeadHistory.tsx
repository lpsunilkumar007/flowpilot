import { formatHelper } from '@/helpers/format.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { leadService } from '@/services/LeadService'
import type { ViewLeadAssignmentHistoryResponse, ViewLeadStatusHistoryResponse } from '@/types/crm/lead.types'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getUserDisplayName, leadCardClass } from '../helpers/leadDisplay.helper'
import LeadSectionCard from './shared/LeadSectionCard'
import LeadStatusBadge from './shared/LeadStatusBadge'
import { userService } from '@/services/UserService'
import type { ViewUserDetailsResponse } from '@/helpers/api/WebApiClient'

interface ViewLeadHistoryProps {
	id: string
}

const ViewLeadHistory: React.FC<ViewLeadHistoryProps> = ({ id }) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(true)
	const [statusHistories, setStatusHistories] = useState<ViewLeadStatusHistoryResponse[]>([])
	const [assignmentHistories, setAssignmentHistories] = useState<ViewLeadAssignmentHistoryResponse[]>([])
	const [users, setUsers] = useState<ViewUserDetailsResponse[]>([])

	useEffect(() => {
		const load = async () => {
			setLoading(true)
			try {
				const [lead, userList] = await Promise.all([leadService.getById(Number(id)), userService.getList()])
				setStatusHistories(lead.statusHistories ?? [])
				setAssignmentHistories(lead.assignmentHistories ?? [])
				setUsers(userList)
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [id])

	if (loading) return <AnimationSkeleton />

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
									{h.fromStatus != null ? <LeadStatusBadge status={h.fromStatus} /> : <span className="text-sm text-gray-400">Start</span>}
									<i className="ri-arrow-right-line text-gray-400" />
									<LeadStatusBadge status={h.toStatus} />
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
