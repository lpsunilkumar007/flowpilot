import { ReactNode } from 'react'

interface PopupFooterProps {
	children: ReactNode
	className?: string
}

const PopupFooter: React.FC<PopupFooterProps> = ({ children, className = '' }) => {
	return <div className={`flex justify-end items-center gap-2 p-4 border-t dark:border-slate-700 ${className}`.trim()}>{children}</div>
}

export default PopupFooter
