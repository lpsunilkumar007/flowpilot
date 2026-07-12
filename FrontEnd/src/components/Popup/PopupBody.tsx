import { ReactNode } from 'react'

interface PopupBodyProps {
	children: ReactNode
	className?: string
}

const PopupBody: React.FC<PopupBodyProps> = ({ children, className = '' }) => {
	return <div className={`p-4 overflow-y-auto ${className}`.trim()}>{children}</div>
}

export default PopupBody
