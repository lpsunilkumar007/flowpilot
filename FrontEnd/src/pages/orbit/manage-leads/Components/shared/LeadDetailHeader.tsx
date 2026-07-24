import { formatHelper } from '@/helpers/format.helper'
import type { ViewLeadDetailResponse } from '@/types/crm/lead.types'
import { getUserDisplayName, leadCardClass, type LeadUserLookup } from '../../helpers/leadDisplay.helper'
import LeadStatusBadge from './LeadStatusBadge'

interface LeadDetailHeaderProps {
	lead: ViewLeadDetailResponse
	users: LeadUserLookup[]
}

const LeadDetailHeader: React.FC<LeadDetailHeaderProps> = ({ lead, users }) => (
	<div className={`${leadCardClass} overflow-hidden`}>
		<div className="bg-gradient-to-r from-primary/5 via-transparent to-transparent px-6 py-6 dark:from-primary/10">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
				<div>
					<p className="text-sm font-medium text-gray-500">Lead #{lead.id}</p>
					<h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{lead.businessName}</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-300">
						{lead.ownerName} · {lead.mobile}
						{lead.email ? ` · ${lead.email}` : ''}
					</p>
					<div className="mt-3 flex flex-wrap gap-2">
						<LeadStatusBadge statusName={lead.leadStatusName} />
						<span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">{lead.businessType}</span>
						{lead.leadSource && <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">{lead.leadSource}</span>}
					</div>
				</div>
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[28rem]">
					<div className="rounded-xl bg-white/80 p-3 dark:bg-gray-900/50">
						<p className="text-xs text-gray-500">Assigned</p>
						<p className="mt-1 text-sm font-semibold">{getUserDisplayName(users, lead.assignedToUserId)}</p>
					</div>
					<div className="rounded-xl bg-white/80 p-3 dark:bg-gray-900/50">
						<p className="text-xs text-gray-500">Next follow-up</p>
						<p className="mt-1 text-sm font-semibold">{lead.nextFollowUpDate ? formatHelper.MomentDateFormat(lead.nextFollowUpDate) : '—'}</p>
					</div>
					<div className="rounded-xl bg-white/80 p-3 dark:bg-gray-900/50">
						<p className="text-xs text-gray-500">Expected revenue</p>
						<p className="mt-1 text-sm font-semibold">{lead.expectedRevenue ?? '—'}</p>
					</div>
					<div className="rounded-xl bg-white/80 p-3 dark:bg-gray-900/50">
						<p className="text-xs text-gray-500">Created</p>
						<p className="mt-1 text-sm font-semibold">{formatHelper.MomentDateFormat(lead.createdOn)}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
)

export default LeadDetailHeader
