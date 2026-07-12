import { ReactNode } from 'react'

type PopupWrapperVariant = 'default' | 'appointment' | 'compact' | 'form-tabs' | 'edit-country'

interface PopupWrapperProps {
	children: ReactNode
	variant?: PopupWrapperVariant
	className?: string
}

const PopupWrapper: React.FC<PopupWrapperProps> = ({ children, variant = 'default', className = '' }) => {
	const variantClass = `popup-wrapper--${variant}`
	const classes = `popup-wrapper ${variantClass} ${className}`.trim()
	return <div className={classes}>{children}</div>
}

export default PopupWrapper
