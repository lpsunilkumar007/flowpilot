import { ReactNode } from 'react'

interface PageBodyProps {
	children: ReactNode
	className?: string
}

const PageBody: React.FC<PageBodyProps> = ({ children, className = '' }) => {
	return <div className={`p-6 ${className}`.trim()}>{children}</div>
}

export default PageBody
