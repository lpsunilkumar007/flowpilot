import { ReactNode } from 'react'

interface PageWrapperProps {
	children: ReactNode
	className?: string
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = '' }) => {
	return <div className={`card ${className}`.trim()}>{children}</div>
}

export default PageWrapper
