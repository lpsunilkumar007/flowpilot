import { ReactNode } from 'react'

interface PageTitleProps {
	actions?: ReactNode
	className?: string
}

const PageTitle: React.FC<PageTitleProps> = ({ actions, className = '' }) => {
	return (
		<div className={`card-header ${className}`.trim()}>
			<div className="flex justify-between items-center">
				<h4 className="card-title">{actions && <div>{actions}</div>}</h4>
			</div>
		</div>
	)
}

export default PageTitle
