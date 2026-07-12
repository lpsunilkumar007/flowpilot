import React from 'react'

export type EmptyStateProps = {
	title: string
	description?: string
	variant?: 'muted' | 'card'
	className?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, variant = 'muted', className = '' }) => {
	const variantClass = variant === 'card' ? 'orbit-empty-state orbit-empty-state--card' : 'orbit-empty-state'
	const classes = [variantClass, className].filter(Boolean).join(' ')

	return (
		<div className={classes}>
			<div className="orbit-empty-state__title">{title}</div>
			{description ? <div className="orbit-empty-state__desc">{description}</div> : null}
		</div>
	)
}

export default EmptyState
