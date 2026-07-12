import { leadCardClass } from '../../helpers/leadDisplay.helper'

interface LeadStatCardProps {
	label: string
	value: string | number
	icon: string
	accent?: 'primary' | 'success' | 'warning' | 'danger'
}

const accentMap = {
	primary: 'bg-primary/10 text-primary',
	success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
	warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
	danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
}

const LeadStatCard: React.FC<LeadStatCardProps> = ({ label, value, icon, accent = 'primary' }) => (
	<div className={`${leadCardClass} p-4`}>
		<div className="flex items-center gap-3">
			<div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentMap[accent]}`}>
				<i className={`${icon} text-xl`} />
			</div>
			<div>
				<p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
				<p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
			</div>
		</div>
	</div>
)

export default LeadStatCard
