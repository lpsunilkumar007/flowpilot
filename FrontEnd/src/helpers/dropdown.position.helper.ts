import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

export interface DropdownPosition {
	top: number
	right: number
}

export interface UseDropdownPositionOptions {
	menuWidth?: number
	menuHeight?: number
	offset?: number
	isOpen: boolean
}

/**
 * Custom hook for auto-adjusting dropdown menu position
 * Automatically positions a dropdown menu based on available viewport space
 * 
 * @param options - Configuration options for dropdown positioning
 * @param options.menuWidth - Width of the dropdown menu in pixels (default: 120)
 * @param options.menuHeight - Height of the dropdown menu in pixels (default: 80)
 * @param options.offset - Spacing offset from button in pixels (default: 8)
 * @param options.isOpen - Whether the dropdown is currently open
 * 
 * @returns An object containing:
 * - position: Current calculated position { top, right }
 * - buttonRef: Ref to attach to the trigger button
 * 
 * @example
 * ```tsx
 * const { position, buttonRef } = useDropdownPosition({
 *   isOpen: isMenuOpen,
 *   menuWidth: 150,
 *   menuHeight: 100
 * })
 * 
 * return (
 *   <button ref={buttonRef}>Toggle</button>
 *   {isOpen && (
 *     <div style={{ top: `${position.top}px`, right: `${position.right}px`, position: 'fixed' }}>
 *       Menu content
 *     </div>
 *   )}
 * )
 * ```
 */
export const useDropdownPosition = (options: UseDropdownPositionOptions) => {
	const { menuWidth = 120, menuHeight = 80, offset = 8, isOpen } = options
	const [position, setPosition] = useState<DropdownPosition>({ top: 0, right: 0 })
	const buttonRef = useRef<HTMLButtonElement>(null)

	const calculatePosition = useCallback(() => {
		if (buttonRef.current) {
			const buttonRect = buttonRef.current.getBoundingClientRect()
			const spaceRight = window.innerWidth - buttonRect.right
			const spaceBelow = window.innerHeight - buttonRect.bottom
			const spaceLeft = buttonRect.left
			const spaceAbove = buttonRect.top

			// Auto-adjust horizontal position
			let right = 0
			if (spaceRight >= menuWidth) {
				// Enough space on right, align to right edge of button
				right = window.innerWidth - buttonRect.right
			} else if (spaceLeft >= menuWidth) {
				// Not enough space on right, but enough on left
				right = window.innerWidth - buttonRect.left - menuWidth
			} else {
				// Not enough space on either side, center it
				right = window.innerWidth - buttonRect.left - buttonRect.width / 2 - menuWidth / 2
			}

			// Auto-adjust vertical position
			let top = buttonRect.bottom + offset // Default: below button
			if (spaceBelow < menuHeight && spaceAbove >= menuHeight) {
				// Not enough space below, but enough above
				top = buttonRect.top - menuHeight - offset
			} else if (spaceBelow < menuHeight && spaceAbove < menuHeight) {
				// Not enough space on either side, position within viewport
				top = Math.max(offset, Math.min(buttonRect.top, window.innerHeight - menuHeight - offset))
			}

			setPosition({ top, right })
		}
	}, [menuWidth, menuHeight, offset])

	useLayoutEffect(() => {
		if (isOpen) {
			calculatePosition()
		}
	}, [isOpen, calculatePosition])

	useEffect(() => {
		if (isOpen) {
			const handleResize = () => {
				calculatePosition()
			}
			window.addEventListener('resize', handleResize)
			window.addEventListener('scroll', handleResize, true)
			return () => {
				window.removeEventListener('resize', handleResize)
				window.removeEventListener('scroll', handleResize, true)
			}
		}
	}, [isOpen, calculatePosition])

	return {
		position,
		buttonRef,
	}
}

/**
 * Utility function to calculate dropdown position without React hooks
 * Useful for one-off calculations or non-React contexts
 * 
 * @param buttonElement - The trigger button element
 * @param menuWidth - Width of the dropdown menu in pixels
 * @param menuHeight - Height of the dropdown menu in pixels
 * @param offset - Spacing offset from button in pixels
 * @returns Calculated position { top, right }
 */
export const calculateDropdownPosition = (
	buttonElement: HTMLElement,
	menuWidth: number = 120,
	menuHeight: number = 80,
	offset: number = 8
): DropdownPosition => {
	const buttonRect = buttonElement.getBoundingClientRect()
	const spaceRight = window.innerWidth - buttonRect.right
	const spaceBelow = window.innerHeight - buttonRect.bottom
	const spaceLeft = buttonRect.left
	const spaceAbove = buttonRect.top

	// Auto-adjust horizontal position
	let right = 0
	if (spaceRight >= menuWidth) {
		right = window.innerWidth - buttonRect.right
	} else if (spaceLeft >= menuWidth) {
		right = window.innerWidth - buttonRect.left - menuWidth
	} else {
		right = window.innerWidth - buttonRect.left - buttonRect.width / 2 - menuWidth / 2
	}

	// Auto-adjust vertical position
	let top = buttonRect.bottom + offset
	if (spaceBelow < menuHeight && spaceAbove >= menuHeight) {
		top = buttonRect.top - menuHeight - offset
	} else if (spaceBelow < menuHeight && spaceAbove < menuHeight) {
		top = Math.max(offset, Math.min(buttonRect.top, window.innerHeight - menuHeight - offset))
	}

	return { top, right }
}


