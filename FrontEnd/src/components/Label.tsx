import { ReactNode } from 'react'

const LABEL_VARIANTS: Record<string, string> = {
	form: 'form-label',
	'form-auth': 'form-label-auth',
	readonly: 'readonly-label',
	search: 'label-search',
	field: 'label-field',
	section: 'label-section',
	'section-alt': 'label-section-alt',
	checkbox: 'label-checkbox',
	card: 'label-card',
}

export interface LabelProps {
	children: ReactNode
	variant?: 'form' | 'form-auth' | 'readonly' | 'search' | 'field' | 'section' | 'section-alt' | 'checkbox' | 'card'
	htmlFor?: string
	className?: string
	as?: 'label' | 'span' | 'div'
}

const Label = ({ children, variant = 'form', htmlFor, className = '', as: Tag = 'label' }: LabelProps) => {
	const variantClass = LABEL_VARIANTS[variant] ?? ''
	const combinedClass = [variantClass, className].filter(Boolean).join(' ')

	const props = Tag === 'label' && htmlFor ? { htmlFor } : {}
	return (
		<Tag className={combinedClass} {...props}>
			{children}
		</Tag>
	)
}

export default Label
