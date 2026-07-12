import { ReactNode } from 'react'

interface PageFilterActionsProps {
	children: ReactNode
	className?: string
}

const PageFilterActions: React.FC<PageFilterActionsProps> = ({ children, className = '' }) => {
	return (
		<div className={`grid lg:grid-cols-12 gap-6 py-3 ${className}`.trim()}>
			<div className="col-span-12 lg:col-span-9 flex items-center space-x-2">{children}</div>
		</div>
	)
}

export default PageFilterActions
