import ActionDropdown from '@/components/ActionDropdown'
import { MenuLinks } from '@/constants/menu'
import { PermissionTypes } from '@/constants/permissions'
import { formatHelper } from '@/helpers/format.helper'
import type { ViewLeadListResponse } from '@/types/crm/lead.types'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { getUserDisplayName, leadCardClass, type LeadUserLookup } from '../../helpers/leadDisplay.helper'
import LeadStatusBadge from './LeadStatusBadge'

interface LeadListCardProps {
	lead: ViewLeadListResponse
	users: LeadUserLookup[]
	canDelete?: boolean
	onDelete?: () => void
}

const LeadListCard: React.FC<LeadListCardProps> = ({ lead, users, canDelete = false, onDelete }) => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const detailUrl = MenuLinks.EditLead.replace(':id', String(lead.id))

	return (
		<article className={`${leadCardClass} group cursor-pointer p-5 transition-all hover:-translate-y-0.5 hover:shadow-md`} onClick={() => navigate(detailUrl)} onKeyDown={(e) => e.key === 'Enter' && navigate(detailUrl)} role="button" tabIndex={0}>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="text-xs font-medium uppercase tracking-wide text-gray-400">#{lead.id}</p>
					<h3 className="mt-1 truncate text-lg font-semibold text-gray-900 group-hover:text-primary dark:text-gray-100">{lead.businessName}</h3>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
						{lead.ownerName} · {lead.mobile}
					</p>
				</div>
				<div className="flex shrink-0 items-start gap-2">
					<LeadStatusBadge statusName={lead.leadStatusName} />
					{canDelete && onDelete && (
						<div
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => e.stopPropagation()}
						>
							<ActionDropdown
								label={t('Common.Action', 'Action')}
								menuWidth={140}
								minWidthPx={140}
								items={[
									{
										key: 'delete',
										label: t('Common.Delete', 'Delete'),
										onClick: onDelete,
										permission: PermissionTypes.Permissions_ManageLeads_Delete,
										disabled: !canDelete,
									},
								]}
							/>
						</div>
					)}
				</div>
			</div>

			<div className="mt-4 grid grid-cols-2 gap-3 text-sm">
				<div>
					<p className="text-gray-400">Business type</p>
					<p className="font-medium text-gray-800 dark:text-gray-200">{lead.businessType}</p>
				</div>
				<div>
					<p className="text-gray-400">Offering</p>
					<p className="font-medium text-gray-800 dark:text-gray-200">{lead.offeringName || 'Unassigned'}</p>
				</div>
				<div>
					<p className="text-gray-400">Assigned to</p>
					<p className="font-medium text-gray-800 dark:text-gray-200">{getUserDisplayName(users, lead.assignedToUserId)}</p>
				</div>
				<div>
					<p className="text-gray-400">Expected revenue</p>
					<p className="font-medium text-gray-800 dark:text-gray-200">{lead.expectedRevenue != null ? lead.expectedRevenue : '—'}</p>
				</div>
			</div>

			<div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
				<span>Next follow-up: {lead.nextFollowUpDate ? formatHelper.MomentDateFormat(lead.nextFollowUpDate) : '—'}</span>
				<span>Last activity: {lead.lastActivityDate ? formatHelper.MomentDateFormat(lead.lastActivityDate) : '—'}</span>
			</div>

			<div className="mt-3 flex justify-end">
				<span className="text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">View lead →</span>
			</div>
		</article>
	)
}

export default LeadListCard
