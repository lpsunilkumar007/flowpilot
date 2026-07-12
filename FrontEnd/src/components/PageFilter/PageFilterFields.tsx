import { ReactNode } from 'react'

interface PageFilterFieldsProps {
	children: ReactNode
	className?: string
}

const PageFilterFields: React.FC<PageFilterFieldsProps> = ({ children, className = '' }) => {
	return <div className={` ${className}`.trim()}>{children}</div>
}

export default PageFilterFields
