import { Fragment, ReactNode } from 'react'
import { Popover, Transition } from '@headlessui/react'
import type { Placement } from '@floating-ui/dom'

interface PopoverLayoutProps {
	toggler: ReactNode
	children: ReactNode
	togglerClass?: string
	placement?: Placement
	menuClass?: string
}

/**
 * Maps a Floating UI placement string to CSS positioning classes.
 */
const getPlacementClasses = (placement?: Placement): string => {
	switch (placement) {
		case 'bottom-end':
			return 'right-0 top-full'
		case 'bottom-start':
			return 'left-0 top-full'
		case 'top-end':
			return 'right-0 bottom-full'
		case 'top-start':
			return 'left-0 bottom-full'
		case 'top':
			return 'left-1/2 -translate-x-1/2 bottom-full'
		case 'bottom':
		default:
			return 'left-1/2 -translate-x-1/2 top-full'
	}
}

const PopoverLayout = ({ children, toggler, togglerClass, placement, menuClass }: PopoverLayoutProps) => {
	return (
		<Popover className="relative">
			<>
				<Popover.Button className={togglerClass ?? ''}>{toggler}</Popover.Button>
				<Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-out duration-200" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
					<Popover.Panel className={`absolute z-50 ${getPlacementClasses(placement)} ${menuClass ?? ''}`}>{children}</Popover.Panel>
				</Transition>
			</>
		</Popover>
	)
}

const PopoverLayoutAutoAdjust = ({ children, toggler, togglerClass, menuClass, placement }: PopoverLayoutProps) => {
	return (
		<Popover className="relative">
			<>
				<Popover.Button className={togglerClass ?? ''}>{toggler}</Popover.Button>
				<Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-out duration-200" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
					<Popover.Panel className={`absolute z-50 mt-1 ${getPlacementClasses(placement)} ${menuClass ?? ''}`}>{children}</Popover.Panel>
				</Transition>
			</>
		</Popover>
	)
}

export { PopoverLayoutAutoAdjust }

export default PopoverLayout
