import { Fragment, useRef, useState } from 'react'
import { OffcanvasLayout } from './HeadlessUI'

export interface BottomSheetOption {
    label: string
    value?: any
    checked?: boolean
    onChange?: (checked: boolean) => void
    onClick?: () => void
    className?: string
}

interface BottomSheetSelectProps {
    label?: string
    placeholder?: string
    options?: BottomSheetOption[]
    value?: any
    onSelect?: (value: any) => void
    containerClass?: string
    labelClassName?: string
    triggerClassName?: string
    isMultiSelect?: boolean
}

const BottomSheetSelect = ({ label, placeholder = 'Select option', options = [], value, onSelect, containerClass, labelClassName, triggerClassName, isMultiSelect = false }: BottomSheetSelectProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [sheetHeight, setSheetHeight] = useState(350)
    const [isDragging, setIsDragging] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const dragStartY = useRef(0)
    const dragStartHeight = useRef(0)

    const toggle = () => {
        const newOpenState = !isOpen
        setIsOpen(newOpenState)
        if (!newOpenState) {
            setSearchTerm('')
            setSheetHeight(350)
        }
    }

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true)
        dragStartY.current = e.clientY
        dragStartHeight.current = sheetHeight
            ; (e.target as HTMLElement).setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return
        const delta = dragStartY.current - e.clientY
        const newHeight = Math.max(150, Math.min(window.innerHeight * 0.95, dragStartHeight.current + delta))
        setSheetHeight(newHeight)
    }

    const handlePointerUp = () => {
        setIsDragging(false)
        if (sheetHeight < 200) {
            setIsOpen(false)
            setSearchTerm('')
            setSheetHeight(350)
        } else if (sheetHeight > window.innerHeight * 0.6) {
            setSheetHeight(window.innerHeight * 0.9)
        } else {
            setSheetHeight(350)
        }
    }

    const isSelected = (optionValue: any) => {
        if (isMultiSelect) {
            return Array.isArray(value) && value.includes(optionValue)
        }
        return value === optionValue
    }

    const handleSelect = (optionValue: any) => {
        if (isMultiSelect) {
            const currentValues = Array.isArray(value) ? [...value] : value ? [value] : []
            if (currentValues.includes(optionValue)) {
                onSelect?.(currentValues.filter((v: any) => v !== optionValue))
            } else {
                onSelect?.([...currentValues, optionValue])
            }
        } else {
            onSelect?.(optionValue)
            setIsOpen(false)
            setSearchTerm('')
        }
    }

    const getDisplayValue = () => {
        if (isMultiSelect) {
            const selectedValues = Array.isArray(value) ? value : value ? [value] : []
            if (selectedValues.length === 0) return placeholder

            const selectedLabels = options.filter((opt) => selectedValues.includes(opt.value)).map((opt) => opt.label)

            return selectedLabels.join(', ')
        }
        const opt = options.find((o) => o.value === value)
        return opt ? opt.label : placeholder
    }

    const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
        <div className={containerClass}>
            {label && <label className={`block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5 ${labelClassName}`}>{label}</label>}

            <button type="button" onClick={toggle} className={`${triggerClassName} text-left`}>
                <span className={getDisplayValue() !== placeholder ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-400 dark:text-gray-500'}>{getDisplayValue()}</span>
            </button>

            <OffcanvasLayout open={isOpen} toggleOffcanvas={toggle} placement="bottom" sizeClassName="rounded-t-[2.5rem]">
                <div style={{ height: `${sheetHeight}px` }} className={`bg-white dark:bg-gray-800 flex flex-col overflow-hidden ${isDragging ? '' : 'transition-[height] duration-300 ease-out'}`}>
                    <div className="px-4 pt-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex justify-center mb-6 touch-none" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
                            <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full cursor-grab active:cursor-grabbing hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"></div>
                        </div>

                        <div className="mb-2 px-2">
                            <div className="relative">
                                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/60 border-none rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-4 pb-12">
                        <div className="space-y-1">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option, index) => {
                                    const selected = isSelected(option.value)

                                    return (
                                        <Fragment key={index}>
                                            <div
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all active:scale-[0.98]
				                                ${selected ? 'bg-primary/10 dark:bg-primary/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'}
				                                ${option.className ?? ''}`}
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    if (option.onClick) option.onClick()
                                                    if (option.value !== undefined) handleSelect(option.value)
                                                }}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col">
                                                        <span className={`text-[17px] font-medium ${selected ? 'text-primary' : 'text-gray-900 dark:text-gray-100'}`}>{option.label}</span>
                                                    </div>
                                                </div>

                                                <div className="relative inline-flex items-center">
                                                    {isMultiSelect ? (
                                                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${selected ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600'}`}>{selected && <i className="ri-check-line text-white text-sm"></i>}</div>
                                                    ) : (
                                                        <input type="checkbox" className="sr-only peer" checked={selected} readOnly />
                                                    )}
                                                </div>
                                            </div>
                                        </Fragment>
                                    )
                                })
                            ) : (
                                <div className="py-10 text-center text-gray-500 dark:text-gray-400">No results found for "{searchTerm}"</div>
                            )}
                        </div>
                    </div>
                </div>
            </OffcanvasLayout>
        </div>
    )
}

export default BottomSheetSelect
