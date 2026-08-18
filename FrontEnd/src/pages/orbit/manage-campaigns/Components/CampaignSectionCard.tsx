import type { ReactNode } from 'react'

const cardClass = 'rounded-xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800'

interface CampaignSectionCardProps {
	title: string
	subtitle?: string
	icon?: string
	children: ReactNode
	actions?: ReactNode
	className?: string
}

const CampaignSectionCard: React.FC<CampaignSectionCardProps> = ({ title, subtitle, icon, children, actions, className = '' }) => (
	<section className={`${cardClass} overflow-hidden ${className}`}>
		<div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-gray-700">
			<div className="flex items-start gap-3">
				{icon && (
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<i className={`${icon} text-lg`} />
					</div>
				)}
				<div>
					<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
					{subtitle && <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
				</div>
			</div>
			{actions}
		</div>
		<div className="p-5">{children}</div>
	</section>
)

export default CampaignSectionCard
