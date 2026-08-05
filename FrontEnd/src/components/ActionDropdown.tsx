import { PermissionTypes } from '@/constants/permissions'
import { useDropdownPosition } from '@/helpers/dropdown.position.helper'
import { usePermission } from '@/hooks/usePermission'
import React, { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

export type ActionDropdownItem = {
	key: string
	label: React.ReactNode
	onClick: () => void
	permission?: PermissionTypes
	disabled?: boolean
	className?: string
}

export type ActionDropdownProps = {
	label: React.ReactNode
	items: ActionDropdownItem[]
	menuWidth?: number
	menuHeight?: number
	offset?: number
	minWidthPx?: number
	buttonClassName?: string
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ label, items, menuWidth = 120, menuHeight = 80, offset = 8, minWidthPx = 120, buttonClassName = 'btn btn-primary orbit-action-trigger' }) => {
	const [isOpen, setIsOpen] = useState(false)
	const { userHasPermission } = usePermission()
	const { position, buttonRef } = useDropdownPosition({ isOpen, menuWidth, menuHeight, offset })

	const visibleItems = useMemo(() => {
		return items.filter((i) => (i.permission ? userHasPermission(i.permission) : true))
	}, [items, userHasPermission])

	const menu =
		isOpen &&
		createPortal(
			<>
				<div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
				<div
					className="orbit-action-menu"
					style={
						{
							['--orbit-menu-top' as any]: `${position.top}px`,
							['--orbit-menu-right' as any]: `${position.right}px`,
							['--orbit-menu-min-width' as any]: `${minWidthPx}px`,
						} as React.CSSProperties
					}
				>
					{visibleItems.map((item) => (
						<button
							key={item.key}
							type="button"
							className={item.key === 'delete' ? 'action-menu-item action-menu-item--danger' : item.className ?? 'action-menu-item'}
							disabled={item.disabled}
							onClick={() => {
								item.onClick()
								setIsOpen(false)
							}}
						>
							{item.label}
						</button>
					))}
				</div>
			</>,
			document.body
		)

	return (
		<div className="relative">
			<button ref={buttonRef} onClick={() => setIsOpen((p) => !p)} className={buttonClassName} type="button">
				{label} <i className="pl-1 ri-arrow-down-s-fill" />
			</button>
			{menu}
		</div>
	)
}

export default ActionDropdown
