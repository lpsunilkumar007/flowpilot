import { Tab, Listbox, Transition } from '@headlessui/react'
import { ReactNode, useState, useEffect, Fragment } from 'react'

export interface TabItem {
	key: string | number
	title: string | ReactNode
	content: ReactNode
}

interface TabsWrapperProps {
	tabs: TabItem[]
	variant?: 'basic' | 'bar' | 'card' | 'pill' | 'justified' | 'vertical'
	defaultIndex?: number
	selectedIndex?: number
	onChange?: (index: number) => void
	className?: string
	tabListClassName?: string
	tabClassName?: string
	panelClassName?: string
	tabPanelsClassName?: string
}

const TabsWrapper = ({ tabs, variant = 'basic', tabClassName, defaultIndex, selectedIndex, onChange, className = '', tabListClassName = '', panelClassName = '', tabPanelsClassName = '' }: TabsWrapperProps) => {
	const [internalIndex, setInternalIndex] = useState(selectedIndex ?? defaultIndex ?? 0)

	useEffect(() => {
		if (selectedIndex !== undefined) {
			setInternalIndex(selectedIndex)
		}
	}, [selectedIndex])

	const handleIndexChange = (index: number) => {
		setInternalIndex(index)
		onChange?.(index)
	}

	const getTabListClass = () => {
		switch (variant) {
			case 'bar':
				return `relative z-0 border rounded-xl overflow-hidden dark:border-gray-600 ${tabListClassName}`
			case 'card':
				return `${tabListClassName}`
			case 'pill':
				return `flex w-full  bg-gray-100/50 dark:bg-gray-900/40 rounded-xl py-3 ${tabListClassName}`
			case 'justified':
				return `space-x-2 ${tabListClassName}`
			case 'vertical':
				return `lg:flex-col gap-2 space-y-2 ${tabListClassName}`
			default:
				return tabListClassName
		}
	}

	const getTabClass = (selected: boolean) => {
		switch (variant) {
			case 'bar':
				return `relative min-w-0 flex-1 bg-white first:border-l-0 border-l border-b-2 p-3 text-gray-500 text-sm font-medium text-center overflow-hidden hover:bg-gray-50 focus:z-10 dark:bg-gray-800 dark:border-l-gray-700 dark:border-b-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-400 ${selected ? 'border-b-primary text-gray-900 dark:text-white' : 'hover:bg-gray-50 hover:text-gray-700'} ${tabClassName}`
			case 'card':
				return `dark:bg-gray-800 dark:border-b-gray-800 -mb-px p-3 inline-flex items-center text-sm font-medium text-center border text-gray-500 rounded-t-lg ${selected ? 'text-primary bg-white border-b-transparent dark:bg-gray-800 dark:border-b-gray-800 dark:text-white' : 'text-gray hover:text-gray-700 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'} ${tabClassName}`
			case 'pill':
				return `flex-1 p-2 text-sm font-semibold rounded transition-all duration-300 ${selected ? 'bg-primary text-white shadow-lg ' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white dark:hover:bg-gray-800'} ${tabClassName}`
			case 'justified':
				return `${selected ? 'bg-primary text-white' : 'text-gray-500 hover:text-primary bg-transparent'} flex-auto py-3 px-4 inline-flex justify-center items-center gap-2 text-center text-sm font-medium rounded-lg dark:hover:text-gray-400 ${tabClassName}`
			case 'vertical':
				return `btn w-full text-left ${selected ? 'bg-primary text-white' : 'bg-transparent'} ${tabClassName}`
			default:
				return ''
		}
	}

	const renderTabs = () => (
		<Tab.Group vertical={variant === 'vertical'} selectedIndex={internalIndex} onChange={handleIndexChange}>
			<div className="block lg:hidden mb-4">
				<Listbox value={internalIndex} onChange={handleIndexChange}>
					<div className="relative mt-1">
						<Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-800 py-3 pl-4 pr-10 text-left border border-gray-200 dark:border-gray-700 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm shadow-sm transition-all duration-200 hover:border-primary">
							<span className="block font-medium text-gray-700 dark:text-gray-200">{tabs[internalIndex]?.title}</span>
							<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
								<i className="ri-arrow-down-s-line text-gray-400 text-xl" />
							</span>
						</Listbox.Button>
						<Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
							<Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50 border border-gray-100 dark:border-gray-700">
								{tabs.map((tab, index) => (
									<Listbox.Option key={tab.key} className={({ active }) => `relative cursor-default select-none py-2.5 pl-10 pr-4 transition-colors duration-150 ${active ? 'bg-primary/10 text-primary' : 'text-gray-900 dark:text-gray-200'}`} value={index}>
										{({ selected }) => (
											<>
												<span className={`block  ${selected ? 'font-semibold text-primary' : 'font-normal'}`}>{tab.title}</span>
												{selected ? (
													<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
														<i className="ri-check-line text-lg" aria-hidden="true" />
													</span>
												) : null}
											</>
										)}
									</Listbox.Option>
								))}
							</Listbox.Options>
						</Transition>
					</div>
				</Listbox>
			</div>

			<div className="hidden lg:block">
				<Tab.List as="nav" className={`${getTabListClass()} lg:flex`}>
					{tabs.map((tab) => (
						<Tab key={tab.key} className={({ selected }) => getTabClass(selected)}>
							{tab.title}
						</Tab>
					))}
				</Tab.List>
			</div>

			<Tab.Panels className={`${tabPanelsClassName} mt-4 lg:mt-0`}>
				{tabs.map((tab) => (
					<Tab.Panel key={tab.key} className={`transition-all duration-300 transform outline-none ${panelClassName}`}>
						{tab.content}
					</Tab.Panel>
				))}
			</Tab.Panels>
		</Tab.Group>
	)

	return <div className={className}>{renderTabs()}</div>
}

export default TabsWrapper
