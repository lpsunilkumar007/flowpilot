import { ReactNode } from 'react'

interface PageFilterProps {
	children: ReactNode
	className?: string
}

const PageFilter: React.FC<PageFilterProps> = ({ children, className = '' }) => {
	return <div className={`mb-4 ${className}`.trim()}>{children}</div>
}

export default PageFilter
