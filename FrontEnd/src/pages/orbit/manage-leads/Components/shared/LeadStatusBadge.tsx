import { formatLeadStatus, getLeadStatusTone } from '../../helpers/leadDisplay.helper'

interface LeadStatusBadgeProps {
	statusName: string
	className?: string
}

const toneClasses = {
	success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300',
	danger: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300',
	warning: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300',
	neutral: 'bg-slate-50 text-slate-700 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300',
}

const LeadStatusBadge: React.FC<LeadStatusBadgeProps> = ({ statusName, className = '' }) => {
	const tone = getLeadStatusTone(statusName)
	return (
		<span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneClasses[tone]} ${className}`}>
			{formatLeadStatus(statusName)}
		</span>
	)
}

export default LeadStatusBadge
