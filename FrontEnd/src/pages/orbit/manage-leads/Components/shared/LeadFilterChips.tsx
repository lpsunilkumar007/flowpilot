import { LeadFilterType } from '@/types/crm/lead.types'

export interface LeadFilterOption {
	value: LeadFilterType
	label: string
}

interface LeadFilterChipsProps {
	options: LeadFilterOption[]
	active: LeadFilterType
	onChange: (value: LeadFilterType) => void
}

const LeadFilterChips: React.FC<LeadFilterChipsProps> = ({ options, active, onChange }) => (
	<div className="flex flex-wrap gap-2">
		{options.map((opt) => {
			const selected = active === opt.value
			return (
				<button
					key={opt.value}
					type="button"
					onClick={() => onChange(opt.value)}
					className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
						selected
							? 'bg-primary text-white shadow-sm'
							: 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700'
					}`}
				>
					{opt.label}
				</button>
			)
		})}
	</div>
)

export default LeadFilterChips
